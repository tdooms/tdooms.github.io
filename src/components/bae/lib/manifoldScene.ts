// The imperative Three.js side of the manifold view. A class — not a Svelte
// component — so the reactive Svelte side and the mutable WebGL side have a
// clean boundary. The component owns reactive state and props; this class
// owns the scene graph, RAF loop, GPU buffers, and event listeners.
//
// Lifecycle:
//   const scene = new ManifoldScene(canvas, { onHover, onLabels });
//   scene.setPoints(points);          // initial install + later swaps (tweens)
//   scene.setAxesVisible(v);          // each setter no-ops when already at v
//   scene.setClusterMode(v);          // — diff is implicit in the mutation
//   scene.setAutoRotate(v);
//   scene.dispose();                  // tear down everything, idempotent
//
// Hover state and centroid label positions are pushed back to the caller via
// the constructor callbacks — the class never imports Svelte runes.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { theme } from "./theme";
import type { PointsData } from "./types";

export type Hover =
  | { kind: "origin" }
  | { kind: "context"; tokens: string[]; center: number; sign: number };

export interface LabelPosition { x: number; y: number; visible: boolean; }

export interface ManifoldCallbacks {
  onHover:  (h: Hover | null, screen: { x: number; y: number }) => void;
  onLabels: (positions: LabelPosition[]) => void;
}

// ─── Visual + interaction tuning ──────────────────────────────────────────
// Single source of truth for every magic number that shapes the look.
const LOOK = {
  dotSize:         0.015,                                                    // dot radius in world units (zoom-invariant)
  originRadius:    0.018,                                                    // origin sphere
  axisLen:         1.2,                                                      // eigenvector axes gizmo
  cameraInit:      [1.8, 1.4, 1.8] as const,                                 // initial camera position
  damping:         0.08,                                                     // orbit-controls smoothing
  rotateSpeed:     0.6,
  autoRotateSpeed: 3.0,                                                      // ≈ 10 s per orbit
  hitPx:           14,                                                       // hover hit radius in screen pixels
  flyStep:         0.012,                                                    // WASD/QE per-frame translation in world units
  tweenMs:         500,                                                      // composite-swap tween
};

// Cluster palette — points lerp from neutral up to these per |activation|, so a
// saturated target gives the gradient real range. Indexed by cluster id;
// centroid labels reuse these hexes directly.
export const PALETTE = ["#6699d6", "#dd7676", "#5fb476", "#a779c9", "#dfa845", "#5fb3b1"];

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
`;
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
  }
`;

const NAV_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

const inEditableField = (): boolean => {
  const a = document.activeElement;
  return !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA"
    || (a as HTMLElement).isContentEditable);
};

const ease = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const reducedMotion = (): boolean =>
  typeof window !== "undefined"
  && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;


export class ManifoldScene {
  // Scene graph
  private readonly scene  = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly mesh:    THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;
  private readonly origin:  THREE.Mesh;
  private readonly axes      = new THREE.Group();
  private readonly axesPos   = new THREE.AxesHelper(LOOK.axisLen);
  private readonly axesNeg   = new THREE.AxesHelper(LOOK.axisLen);
  // GPU attribute handles — filled on first ``setPoints``.
  private buffers: {
    xyz: THREE.InstancedBufferAttribute;
    activation: THREE.InstancedBufferAttribute;
    cluster: THREE.InstancedBufferAttribute;
  } | null = null;

  // Per-frame state
  private dirty = true;
  private rafId = 0;
  private tween: {
    from: { xyz: Float32Array; activation: Float32Array };
    to:   { xyz: Float32Array; activation: Float32Array };
    startedAt: number;
  } | null = null;
  private pending: PointerEvent | null = null;
  private clusterMode = false;
  private points: PointsData | null = null;
  private hover: Hover | null = null;

  // Keyboard fly-camera
  private readonly heldKeys = new Set<string>();

  // Reusable scratch — allocating per frame thrashes GC.
  private readonly _vp      = new THREE.Matrix4();
  private readonly _v       = new THREE.Vector3();
  private readonly _forward = new THREE.Vector3();
  private readonly _right   = new THREE.Vector3();
  private readonly _move    = new THREE.Vector3();

  // Lifecycle handles
  private readonly resizeObs: ResizeObserver;
  private readonly canvas: HTMLCanvasElement;
  private readonly cb: ManifoldCallbacks;

  constructor(canvas: HTMLCanvasElement, cb: ManifoldCallbacks) {
    this.canvas = canvas;
    this.cb = cb;

    this.camera.position.set(...LOOK.cameraInit);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    const t = theme();
    const quad = new THREE.PlaneGeometry(1, 1);
    const geom = new THREE.InstancedBufferGeometry();
    geom.index = quad.index;
    geom.setAttribute("position", quad.attributes.position);
    geom.setAttribute("uv", quad.attributes.uv);

    this.mesh = new THREE.Mesh(geom, new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uWorldSize: { value: LOOK.dotSize },
        uMode:      { value: 0 },
        uNeutral:   { value: new THREE.Color(t.base300) },
        uPos:       { value: new THREE.Color(t.primary) },
        uNeg:       { value: new THREE.Color(t.secondary) },
        uColors:    { value: PALETTE.map((c) => new THREE.Color(c)) },
        uMaxMix:    { value: 0.8 },                                           // dots ramp to 80% of full colour, not 100%
      },
      transparent: false,
      depthWrite: true,
    }));
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    // Always-on-top sphere — depthTest=false skips the depth buffer;
    // renderOrder=999 queues this draw last so the cloud writes depth first
    // and the sphere composites over it.
    this.origin = new THREE.Mesh(
      new THREE.SphereGeometry(LOOK.originRadius, 16, 16),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(t.baseContent),
        depthTest: false, depthWrite: false, transparent: true,
      }),
    );
    this.origin.renderOrder = 999;
    this.scene.add(this.origin);

    this.axesNeg.scale.setScalar(-1);
    this.axes.add(this.axesPos, this.axesNeg);
    this.axes.visible = false;
    this.scene.add(this.axes);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = LOOK.damping;
    this.controls.rotateSpeed = LOOK.rotateSpeed;
    this.controls.autoRotateSpeed = LOOK.autoRotateSpeed;
    this.controls.addEventListener("change", () => (this.dirty = true));

    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clearKeys);

    this.installRecordHook();

    this.resizeObs = new ResizeObserver(this.resize);
    this.resizeObs.observe(canvas);
    this.resize();
    this.rafId = requestAnimationFrame(this.tick);
  }

  // ─── Public API (called from the Svelte wrapper) ──────────────────────

  setPoints(p: PointsData): void {
    this.points = p;
    const clusterIds = new Float32Array(p.n);
    if (p.clusters) clusterIds.set(p.clusters.assignment);

    if (!this.buffers) {
      this.buffers = {
        xyz:        new THREE.InstancedBufferAttribute(new Float32Array(p.xyz), 3),
        activation: new THREE.InstancedBufferAttribute(new Float32Array(p.activation), 1),
        cluster:    new THREE.InstancedBufferAttribute(clusterIds, 1),
      };
      this.mesh.geometry.setAttribute("aPosition",   this.buffers.xyz);
      this.mesh.geometry.setAttribute("aActivation", this.buffers.activation);
      this.mesh.geometry.setAttribute("aCluster",    this.buffers.cluster);
    } else if (reducedMotion()) {
      // Skip the tween — write the new geometry in one go.
      (this.buffers.xyz.array as Float32Array).set(p.xyz);
      (this.buffers.activation.array as Float32Array).set(p.activation);
      (this.buffers.cluster.array as Float32Array).set(clusterIds);
      this.buffers.xyz.needsUpdate = true;
      this.buffers.activation.needsUpdate = true;
      this.buffers.cluster.needsUpdate = true;
      this.tween = null;
    } else {
      this.tween = {
        from: {
          xyz:        (this.buffers.xyz.array as Float32Array).slice(),
          activation: (this.buffers.activation.array as Float32Array).slice(),
        },
        to: { xyz: new Float32Array(p.xyz), activation: new Float32Array(p.activation) },
        startedAt: performance.now(),
      };
      (this.buffers.cluster.array as Float32Array).set(clusterIds);
      this.buffers.cluster.needsUpdate = true;
    }
    this.mesh.geometry.instanceCount = p.n;
    this.origin.position.set(...p.origin);
    this.axes.position.set(...p.origin);

    const t = theme();
    const tint = (v: number) => new THREE.Color(v >= 0 ? t.primary : t.secondary);
    const [tx, ty, tz] = p.eigvals.map(tint) as [THREE.Color, THREE.Color, THREE.Color];
    this.axesPos.setColors(tx, ty, tz);
    this.axesNeg.setColors(tx, ty, tz);
    this.dirty = true;
  }

  setAxesVisible(visible: boolean): void {
    this.axes.visible = visible;
    this.dirty = true;
  }

  setClusterMode(on: boolean): void {
    this.clusterMode = on;
    this.mesh.material.uniforms.uMode.value = on ? 1 : 0;
    if (!on) this.cb.onLabels([]);                                           // clear stale labels
    this.dirty = true;
  }

  setAutoRotate(on: boolean): void {
    this.controls.autoRotate = on;
    this.dirty = true;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObs.disconnect();
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clearKeys);
    delete window.__manifold;
    this.controls.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.origin.geometry.dispose();
    (this.origin.material as THREE.Material).dispose();
    this.axesPos.dispose();
    this.axesNeg.dispose();
    this.renderer.dispose();
  }

  // ─── Internals ────────────────────────────────────────────────────────

  private resize = (): void => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  };

  private tick = (): void => {
    this.stepTween();
    this.flyCamera();
    this.pickFromPending();
    this.controls.update();
    if (this.controls.autoRotate) this.dirty = true;                         // keep rendering while spinning
    if (this.dirty || this.clusterMode) this.projectCentroids();
    if (this.dirty) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  private stepTween(): void {
    if (!this.tween || !this.buffers) return;
    const t = Math.min(1, (performance.now() - this.tween.startedAt) / LOOK.tweenMs);
    const e = ease(t);
    const xyz = this.buffers.xyz.array as Float32Array;
    const act = this.buffers.activation.array as Float32Array;
    const { from, to } = this.tween;
    for (let i = 0, m = to.xyz.length; i < m; i++) xyz[i] = from.xyz[i] + (to.xyz[i] - from.xyz[i]) * e;
    for (let i = 0, m = to.activation.length; i < m; i++) act[i] = from.activation[i] + (to.activation[i] - from.activation[i]) * e;
    this.buffers.xyz.needsUpdate = true;
    this.buffers.activation.needsUpdate = true;
    if (t >= 1) this.tween = null;
    this.dirty = true;
  }

  // ─── Pointer / hover ──────────────────────────────────────────────────

  private onPointerMove = (e: PointerEvent): void => { this.pending = e; };
  private onPointerLeave = (): void => {
    this.hover = null;
    this.cb.onHover(null, { x: 0, y: 0 });
  };

  // Defer picking from the pointer handler to the RAF tick — projecting all N
  // points on every move event would double-pay for coalesced events.
  private pickFromPending(): void {
    if (!this.pending || !this.buffers || !this.points) return;
    const e = this.pending; this.pending = null;
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this._vp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

    const baseTol = (LOOK.hitPx / Math.min(rect.width, rect.height)) * 2;
    const tol2 = (this.hover ? baseTol * 1.4 : baseTol) ** 2;                // sticky while hovering
    const xyz = this.buffers.xyz.array as Float32Array;
    const n = this.mesh.geometry.instanceCount;

    let bestI = -1, bestDist2 = Infinity;
    for (let i = 0; i < n; i++) {
      this._v.set(xyz[3 * i], xyz[3 * i + 1], xyz[3 * i + 2]).applyMatrix4(this._vp);
      if (this._v.z < -1 || this._v.z > 1) continue;
      const dx = this._v.x - ndcX, dy = this._v.y - ndcY;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist2) { bestDist2 = d2; bestI = i; }
    }

    // Origin sphere is always-on-top, so it wins ties against the cloud.
    this._v.copy(this.origin.position).applyMatrix4(this._vp);
    const dox = this._v.x - ndcX, doy = this._v.y - ndcY;
    const originDist2 = dox * dox + doy * doy;
    const originHit = this._v.z > -1 && this._v.z < 1 && originDist2 < tol2;

    let next: Hover | null;
    if (originHit && originDist2 <= bestDist2) next = { kind: "origin" };
    else if (bestDist2 < tol2)                 next = { kind: "context", ...this.readContext(bestI) };
    else                                       next = null;

    this.hover = next;
    const W = window.innerWidth, H = window.innerHeight;
    this.cb.onHover(next, {
      x: Math.min(e.clientX + 14, W - 460),
      y: Math.min(e.clientY + 14, H - 56),
    });
  }

  private readContext(i: number): { tokens: string[]; center: number; sign: number } {
    const p = this.points!;
    const length = p.contextLength;
    const start = i * length;
    const tokens = new Array<string>(length);
    for (let j = 0; j < length; j++) tokens[j] = p.vocab[p.context[start + j]];
    return { tokens, center: length >> 1, sign: Math.sign(p.activation[i]) };
  }

  // ─── Keyboard fly-camera ──────────────────────────────────────────────
  // W/S forward/back · A/D strafe · Q/E down/up. Camera and orbit target
  // move together so dragging keeps rotating around the new pivot.

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (!NAV_KEYS.has(k) || inEditableField()) return;
    this.heldKeys.add(k);
    e.preventDefault();
  };
  private onKeyUp = (e: KeyboardEvent): void => { this.heldKeys.delete(e.key.toLowerCase()); };
  private clearKeys = (): void => { this.heldKeys.clear(); };

  private flyCamera(): void {
    if (!this.heldKeys.size) return;
    const s = LOOK.flyStep;
    this.camera.getWorldDirection(this._forward);
    this._right.crossVectors(this._forward, this.camera.up).normalize();
    this._move.set(0, 0, 0);
    if (this.heldKeys.has("w")) this._move.addScaledVector(this._forward,    s);
    if (this.heldKeys.has("s")) this._move.addScaledVector(this._forward,   -s);
    if (this.heldKeys.has("d")) this._move.addScaledVector(this._right,      s);
    if (this.heldKeys.has("a")) this._move.addScaledVector(this._right,     -s);
    if (this.heldKeys.has("e")) this._move.addScaledVector(this.camera.up,   s);
    if (this.heldKeys.has("q")) this._move.addScaledVector(this.camera.up,  -s);
    this.camera.position.add(this._move);
    this.controls.target.add(this._move);
    this.dirty = true;
  }

  // ─── Centroid label projection ────────────────────────────────────────

  private projectCentroids(): void {
    if (!this.clusterMode || !this.points?.clusters) return;
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this._vp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    const positions = this.points.clusters.centroids.map((c) => {
      this._v.set(...c.xyz).applyMatrix4(this._vp);
      return {
        x: ((this._v.x + 1) / 2) * rect.width,
        y: ((1 - this._v.y) / 2) * rect.height,
        visible: this._v.z > -1 && this._v.z < 1,
      };
    });
    this.cb.onLabels(positions);
  }

  // ─── Recorder hook ────────────────────────────────────────────────────
  // Lets ``cli/record.py`` drive the camera frame-by-frame for
  // deterministic-FPS screenshot loops. Cleared on dispose.

  private installRecordHook(): void {
    const sph = new THREE.Spherical(), tmp = new THREE.Vector3();
    window.__manifold = {
      getAzimuth: () => {
        sph.setFromVector3(tmp.copy(this.camera.position).sub(this.controls.target));
        return sph.theta;
      },
      setAzimuth: (theta: number) => {
        sph.setFromVector3(tmp.copy(this.camera.position).sub(this.controls.target));
        sph.theta = theta;
        this.camera.position.setFromSpherical(sph).add(this.controls.target);
        this.controls.update();
        this.dirty = true;
      },
    };
  }
}
