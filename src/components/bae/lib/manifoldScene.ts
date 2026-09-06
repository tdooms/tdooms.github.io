// The imperative Three.js side of the manifold view. A class — not a Svelte
// component — so the reactive Svelte side and the mutable WebGL side have a
// clean boundary. The component owns reactive state and props; this class
// owns the scene graph, RAF loop, GPU buffers, and event listeners.
//
// Lifecycle:
//   const scene = new ManifoldScene(canvas, points, { onHover, onLabels });
//   scene.setAxesVisible(v);
//   scene.setClusterMode(v);
//   scene.setAutoRotate(v);
//   scene.dispose();
//
// Hover state and centroid label positions are pushed back to the caller via
// the constructor callbacks — the class never imports Svelte runes.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { theme } from './theme'
import type { PointsData, Theme } from './types'

export type Hover =
  { kind: 'origin' } | { kind: 'context'; tokens: string[]; center: number; sign: number }

export interface LabelPosition {
  x: number
  y: number
  visible: boolean
}

export interface ManifoldCallbacks {
  onHover: (h: Hover | null, screen: { x: number; y: number }) => void
  onLabels: (positions: LabelPosition[]) => void
}

// ─── Visual + interaction tuning ──────────────────────────────────────────
// Single source of truth for every magic number that shapes the look.
const LOOK = {
  dotSize: 0.015, // dot radius in world units (zoom-invariant)
  originRadius: 0.018, // origin sphere
  axisLen: 1.2, // eigenvector axes gizmo
  cameraInit: [1.8, 1.4, 1.8] as const, // initial camera position
  damping: 0.08, // orbit-controls smoothing
  rotateSpeed: 0.6,
  autoRotateSpeed: 3.0, // ≈ 10 s per orbit
  hitPx: 14, // hover hit radius in screen pixels
  flyStep: 0.012, // WASD/QE per-frame translation in world units
}

// Cluster palette — points lerp from neutral up to these per |activation|, so a
// saturated target gives the gradient real range. Indexed by cluster id;
// centroid labels reuse these hexes directly. Deliberately *not* theme-derived:
// a categorical palette needs six mutually-distinguishable hues, which two
// brand slots can't supply; these mid-lightness values stay legible on both
// the light and dark base.
export const PALETTE = ['#6699d6', '#dd7676', '#5fb476', '#a779c9', '#dfa845', '#5fb3b1']

// ─── Shaders ──────────────────────────────────────────────────────────────
// Custom shader avoids ``gl_PointSize`` (Apple/ANGLE clamps it hard) — render
// camera-facing quads instead. The vertex offset is added in *view space* so
// dots have a fixed *world* size: zoom in → cluster grows, dots grow with it.
const VERT = `
  attribute vec3 aPosition;
  attribute float aActivation;
  attribute float aCluster;
  varying float vActivation;
  varying float vCluster;
  varying vec2 vUv;
  uniform float uWorldSize;
  void main() {
    vActivation = aActivation;
    vCluster = aCluster;
    vUv = position.xy;
    vec4 mv = modelViewMatrix * vec4(aPosition, 1.0);
    mv.xy += position.xy * uWorldSize;
    gl_Position = projectionMatrix * mv;
  }
`
// ``uMode == 0`` is the diverging signed-activation ramp; ``uMode == 1`` lifts
// the cluster colour and modulates by |activation|.
const FRAG = `
  varying float vActivation;
  varying float vCluster;
  varying vec2 vUv;
  uniform int   uMode;
  uniform vec3  uNeutral;
  uniform vec3  uPos;
  uniform vec3  uNeg;
  uniform vec3  uColors[6];
  uniform float uMaxMix;                                                      // cap the ramp short of full colour (softer dots)
  void main() {
    if (length(vUv) > 0.48) discard;                                         // quad → inscribed circle
    vec3 c;
    float t = abs(vActivation) * uMaxMix;
    if (uMode == 0) {
      c = vActivation > 0.0 ? mix(uNeutral, uPos, t) : mix(uNeutral, uNeg, t);
    } else {
      int idx = int(vCluster + 0.5);
      c = mix(uNeutral, uColors[idx], t);
    }
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

const NAV_KEYS = new Set(['w', 'a', 's', 'd', 'q', 'e'])

export class ManifoldScene {
  // Scene graph
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
  private readonly renderer: THREE.WebGLRenderer
  private readonly controls: OrbitControls
  private readonly mesh: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>
  private readonly origin: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  private readonly uniforms = {
    uWorldSize: { value: LOOK.dotSize },
    uMode: { value: 0 },
    uNeutral: { value: new THREE.Color() },
    uPos: { value: new THREE.Color() },
    uNeg: { value: new THREE.Color() },
    uColors: { value: PALETTE.map((c) => new THREE.Color(c)) },
    uMaxMix: { value: 0.8 }, // dots ramp to 80% of full colour
  }
  private readonly axes = new THREE.Group()
  private readonly axesPos = new THREE.AxesHelper(LOOK.axisLen)
  private readonly axesNeg = new THREE.AxesHelper(LOOK.axisLen)
  // Per-frame state
  private dirty = true
  private active = true
  private rafId = 0
  private pending: PointerEvent | null = null
  private clusterMode = false
  private readonly points: PointsData
  private hover: Hover | null = null

  // Keyboard fly-camera
  private readonly heldKeys = new Set<string>()

  // Reusable scratch — allocating per frame thrashes GC.
  private readonly _vp = new THREE.Matrix4()
  private readonly _v = new THREE.Vector3()
  private readonly _forward = new THREE.Vector3()
  private readonly _right = new THREE.Vector3()
  private readonly _move = new THREE.Vector3()

  // Lifecycle handles
  private readonly resizeObs: ResizeObserver
  private readonly unsubscribeTheme: () => void
  private readonly canvas: HTMLCanvasElement
  private readonly cb: ManifoldCallbacks

  constructor(canvas: HTMLCanvasElement, points: PointsData, cb: ManifoldCallbacks) {
    if (
      !Number.isInteger(points.n) ||
      points.n <= 0 ||
      points.xyz.length !== 3 * points.n ||
      points.activation.length !== points.n ||
      !Number.isInteger(points.contextLength) ||
      points.contextLength <= 0 ||
      points.context.length !== points.n * points.contextLength ||
      (points.clusters && points.clusters.assignment.length !== points.n)
    ) {
      throw new Error(
        'Manifold point, activation, context, and cluster buffers must cover the same rows',
      )
    }
    this.canvas = canvas
    this.points = points
    this.cb = cb

    this.camera.position.set(...LOOK.cameraInit)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(devicePixelRatio)
    this.renderer.setClearColor(0x000000, 0)

    const quad = new THREE.PlaneGeometry(1, 1)
    const geom = new THREE.InstancedBufferGeometry()
    geom.index = quad.index
    geom.setAttribute('position', quad.getAttribute('position'))
    geom.setAttribute('uv', quad.getAttribute('uv'))
    const clusterIds = new Float32Array(points.n)
    if (points.clusters) clusterIds.set(points.clusters.assignment)
    geom.setAttribute('aPosition', new THREE.InstancedBufferAttribute(points.xyz, 3))
    geom.setAttribute('aActivation', new THREE.InstancedBufferAttribute(points.activation, 1))
    geom.setAttribute('aCluster', new THREE.InstancedBufferAttribute(clusterIds, 1))
    geom.instanceCount = points.n

    this.mesh = new THREE.Mesh(
      geom,
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: this.uniforms,
        transparent: false,
        depthWrite: true,
      }),
    )
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)

    // Always-on-top sphere — depthTest=false skips the depth buffer;
    // renderOrder=999 queues this draw last so the cloud writes depth first
    // and the sphere composites over it.
    this.origin = new THREE.Mesh(
      new THREE.SphereGeometry(LOOK.originRadius, 16, 16),
      new THREE.MeshBasicMaterial({
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    )
    this.origin.position.set(...points.origin)
    this.origin.renderOrder = 999
    this.scene.add(this.origin)

    this.axesNeg.scale.setScalar(-1)
    this.axes.add(this.axesPos, this.axesNeg)
    this.axes.position.set(...points.origin)
    this.axes.visible = false
    this.scene.add(this.axes)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = LOOK.damping
    this.controls.rotateSpeed = LOOK.rotateSpeed
    this.controls.autoRotateSpeed = LOOK.autoRotateSpeed
    this.controls.addEventListener('change', () => (this.dirty = true))

    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    canvas.addEventListener('keydown', this.onKeyDown)
    canvas.addEventListener('keyup', this.onKeyUp)
    canvas.addEventListener('blur', this.clearKeys)
    window.addEventListener('blur', this.clearKeys)

    this.resizeObs = new ResizeObserver(this.resize)
    this.resizeObs.observe(canvas)
    this.unsubscribeTheme = theme.subscribe(this.setTheme)
    this.resize()
    this.rafId = requestAnimationFrame(this.tick)
  }

  // ─── Public API (called from the Svelte wrapper) ──────────────────────

  setAxesVisible(visible: boolean): void {
    this.axes.visible = visible
    this.dirty = true
  }

  setClusterMode(on: boolean): void {
    this.clusterMode = on
    this.uniforms.uMode.value = on ? 1 : 0
    if (!on) this.cb.onLabels([]) // clear stale labels
    this.dirty = true
  }

  setAutoRotate(on: boolean): void {
    this.controls.autoRotate = on
    this.dirty = true
  }

  // Keep the camera, but stop rendering and keyboard input in a hidden panel.
  setActive(active: boolean): void {
    if (active === this.active) return
    this.active = active
    this.controls.enabled = active
    this.clearKeys()
    this.pending = null
    this.onPointerLeave()
    if (active) {
      this.resize()
      this.rafId = requestAnimationFrame(this.tick)
    } else {
      cancelAnimationFrame(this.rafId)
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId)
    this.resizeObs.disconnect()
    this.unsubscribeTheme()
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('keydown', this.onKeyDown)
    this.canvas.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('blur', this.clearKeys)
    window.removeEventListener('blur', this.clearKeys)
    this.controls.dispose()
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.origin.geometry.dispose()
    this.origin.material.dispose()
    this.axesPos.dispose()
    this.axesNeg.dispose()
    this.renderer.dispose()
  }

  // ─── Internals ────────────────────────────────────────────────────────

  private setTheme = (t: Theme): void => {
    this.uniforms.uNeutral.value.set(t.base300)
    this.uniforms.uPos.value.set(t.primary)
    this.uniforms.uNeg.value.set(t.secondary)
    this.origin.material.color.set(t.baseContent)
    const tint = (v: number) => new THREE.Color(v >= 0 ? t.primary : t.secondary)
    const [tx, ty, tz] = this.points.eigvals.map(tint) as [THREE.Color, THREE.Color, THREE.Color]
    this.axesPos.setColors(tx, ty, tz)
    this.axesNeg.setColors(tx, ty, tz)
    this.dirty = true
  }

  private resize = (): void => {
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  private tick = (): void => {
    this.flyCamera()
    this.pickFromPending()
    this.controls.update()
    if (this.controls.autoRotate) this.dirty = true // keep rendering while spinning
    if (this.dirty) {
      this.renderer.render(this.scene, this.camera)
      // Rendering refreshes the camera matrices used for label projection.
      // A stationary scene needs neither new positions nor Svelte updates.
      this.projectCentroids()
      this.dirty = false
    }
    this.rafId = requestAnimationFrame(this.tick)
  }

  // ─── Pointer / hover ──────────────────────────────────────────────────

  private onPointerMove = (e: PointerEvent): void => {
    this.pending = e
  }
  private onPointerLeave = (): void => {
    this.pending = null
    this.hover = null
    this.cb.onHover(null, { x: 0, y: 0 })
  }

  // Defer picking from the pointer handler to the RAF tick — projecting all N
  // points on every move event would double-pay for coalesced events.
  private pickFromPending(): void {
    if (!this.pending) return
    const e = this.pending
    this.pending = null
    const rect = this.canvas.getBoundingClientRect()
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    this._vp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)

    const baseTol = (LOOK.hitPx / Math.min(rect.width, rect.height)) * 2
    const tol2 = (this.hover ? baseTol * 1.4 : baseTol) ** 2 // sticky while hovering
    const { xyz, n } = this.points

    let bestI = -1,
      bestDist2 = Infinity
    for (let i = 0; i < n; i++) {
      this._v.fromArray(xyz, 3 * i).applyMatrix4(this._vp)
      if (this._v.z < -1 || this._v.z > 1) continue
      const dx = this._v.x - ndcX,
        dy = this._v.y - ndcY
      const d2 = dx * dx + dy * dy
      if (d2 < bestDist2) {
        bestDist2 = d2
        bestI = i
      }
    }

    // Origin sphere is always-on-top, so it wins ties against the cloud.
    this._v.copy(this.origin.position).applyMatrix4(this._vp)
    const dox = this._v.x - ndcX,
      doy = this._v.y - ndcY
    const originDist2 = dox * dox + doy * doy
    const originHit = this._v.z > -1 && this._v.z < 1 && originDist2 < tol2

    let next: Hover | null
    if (originHit && originDist2 <= bestDist2) next = { kind: 'origin' }
    else if (bestDist2 < tol2) next = { kind: 'context', ...this.readContext(bestI) }
    else next = null

    this.hover = next
    const W = window.innerWidth,
      H = window.innerHeight
    this.cb.onHover(next, {
      x: Math.max(8, Math.min(e.clientX + 14, W - 456)),
      y: Math.max(8, Math.min(e.clientY + 14, H - 56)),
    })
  }

  private readContext(i: number): { tokens: string[]; center: number; sign: number } {
    const p = this.points
    if (!Number.isInteger(i) || i < 0 || i >= p.n) {
      throw new RangeError(`Manifold context index ${i} is outside the point buffer`)
    }
    const length = p.contextLength
    const start = i * length
    const tokens = new Array<string>(length)
    // Buffers are checked above; dequantize validates every vocabulary reference.
    for (let j = 0; j < length; j++) {
      tokens[j] = p.vocab[p.context[start + j]!]!
    }
    return { tokens, center: length >> 1, sign: Math.sign(p.activation[i]!) }
  }

  // ─── Keyboard fly-camera ──────────────────────────────────────────────
  // W/S forward/back · A/D strafe · Q/E down/up. Camera and orbit target
  // move together so dragging keeps rotating around the new pivot.

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.active || e.metaKey || e.ctrlKey || e.altKey) return
    const k = e.key.toLowerCase()
    if (!NAV_KEYS.has(k)) return
    this.heldKeys.add(k)
    e.preventDefault()
  }
  private onKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys.delete(e.key.toLowerCase())
  }
  private clearKeys = (): void => {
    this.heldKeys.clear()
  }

  private flyCamera(): void {
    if (!this.heldKeys.size) return
    const s = LOOK.flyStep
    this.camera.getWorldDirection(this._forward)
    this._right.crossVectors(this._forward, this.camera.up).normalize()
    this._move.set(0, 0, 0)
    if (this.heldKeys.has('w')) this._move.addScaledVector(this._forward, s)
    if (this.heldKeys.has('s')) this._move.addScaledVector(this._forward, -s)
    if (this.heldKeys.has('d')) this._move.addScaledVector(this._right, s)
    if (this.heldKeys.has('a')) this._move.addScaledVector(this._right, -s)
    if (this.heldKeys.has('e')) this._move.addScaledVector(this.camera.up, s)
    if (this.heldKeys.has('q')) this._move.addScaledVector(this.camera.up, -s)
    this.camera.position.add(this._move)
    this.controls.target.add(this._move)
    this.dirty = true
  }

  // ─── Centroid label projection ────────────────────────────────────────

  private projectCentroids(): void {
    if (!this.clusterMode || !this.points.clusters) return
    const rect = this.canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    this._vp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
    const positions = this.points.clusters.centroids.map((c) => {
      this._v.set(...c.xyz).applyMatrix4(this._vp)
      return {
        x: ((this._v.x + 1) / 2) * rect.width,
        y: ((1 - this._v.y) / 2) * rect.height,
        visible: this._v.z > -1 && this._v.z < 1,
      }
    })
    this.cb.onLabels(positions)
  }
}
