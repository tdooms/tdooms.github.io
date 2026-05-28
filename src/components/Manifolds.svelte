<script lang="ts">
  import { tableFromIPC } from 'apache-arrow'
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

  type Sample = { name: string; url: string; slug: string }
  let { samples }: { samples: Sample[] } = $props()

  let selected = $state(0)
  let chartElement: HTMLDivElement
  let tooltip: HTMLDivElement

  let renderer: THREE.WebGLRenderer
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let controls: OrbitControls
  let points: THREE.Points | null = null
  let labels: string[] = []
  let circleTexture: THREE.Texture
  let rafId: number | null = null
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  // Blue color gradient (6 stops)
  const COLORS = [
    [222, 235, 247],
    [158, 202, 225],
    [107, 174, 214],
    [66, 146, 198],
    [33, 113, 181],
    [8, 69, 148],
  ].map(([r, g, b]) => new THREE.Color(r / 255, g / 255, b / 255))

  function getColor(value: number): THREE.Color {
    const scaled = value * (COLORS.length - 1)
    const idx = Math.floor(scaled)
    const t = scaled - idx
    const a = COLORS[idx] ?? COLORS[0]!
    const b = COLORS[Math.min(idx + 1, COLORS.length - 1)] ?? a
    return new THREE.Color().lerpColors(a, b, t)
  }

  // Loop-based extrema — Math.min(...arr) stack-overflows on large arrays.
  function extrema(arr: ArrayLike<number>): [number, number] {
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i]!
      if (v < min) min = v
      if (v > max) max = v
    }
    return [min, max]
  }

  function initScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(chartElement.clientWidth, chartElement.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    chartElement.appendChild(renderer.domElement)

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
      60,
      chartElement.clientWidth / chartElement.clientHeight,
      0.1,
      100,
    )
    camera.position.set(1.5, 1.5, 1.5)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 0.3
    controls.maxDistance = 8

    // Origin marker
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000 }),
      ),
    )

    // Reusable circle texture with anti-aliased radial gradient
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    circleTexture = new THREE.CanvasTexture(canvas)

    raycaster.params.Points.threshold = 0.02

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
  }

  async function loadData(url: string) {
    const table = tableFromIPC(await fetch(url).then((r) => r.arrayBuffer()))
    const [x, y, z, values, tokens] = ['x', 'y', 'z', 'value', 'token'].map((col) =>
      table.getChild(col)!.toArray(),
    )

    // Normalize to [-1, 1] with uniform scaling
    const bounds = [x, y, z].map((arr) => extrema(arr))
    const center = bounds.map(([min, max]) => (min + max) / 2)
    const scale = 2 / Math.max(...bounds.map(([min, max]) => max - min))

    const [minVal, maxVal] = extrema(values)
    const targetPos = new Float32Array(x.length * 3)
    const newColors = new Float32Array(x.length * 3)
    labels = []

    for (let i = 0; i < x.length; i++) {
      targetPos[i * 3] = (x[i] - center[0]!) * scale
      targetPos[i * 3 + 1] = (z[i] - center[2]!) * scale
      targetPos[i * 3 + 2] = (y[i] - center[1]!) * scale

      const color = getColor((values[i] - minVal) / (maxVal - minVal))
      newColors.set([color.r, color.g, color.b], i * 3)
      labels.push(tokens[i] || 'Origin')
    }

    // Update origin position
    scene.children[0]!.position.set(-center[0]! * scale, -center[2]! * scale, -center[1]! * scale)

    const needsRecreate = !points || points.geometry.attributes.position!.count !== x.length

    if (needsRecreate) {
      if (points) {
        scene.remove(points)
        points.geometry.dispose()
        ;(points.material as THREE.Material).dispose()
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(targetPos, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3))

      const material = new THREE.PointsMaterial({
        size: 17,
        vertexColors: true,
        map: circleTexture,
        alphaTest: 0.5,
        depthTest: true,
        depthWrite: true,
        sizeAttenuation: false,
      })

      points = new THREE.Points(geometry, material)
      scene.add(points)
    } else {
      // Animate transition
      const posAttr = points!.geometry.attributes.position as THREE.BufferAttribute
      const colorAttr = points!.geometry.attributes.color as THREE.BufferAttribute
      const startPos = new Float32Array(posAttr.array)
      const startColors = new Float32Array(colorAttr.array)

      const duration = 500
      const startTime = performance.now()

      const tween = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease in-out quad

        for (let i = 0; i < targetPos.length; i++) {
          posAttr.array[i] = startPos[i]! + (targetPos[i]! - startPos[i]!) * eased
          colorAttr.array[i] = startColors[i]! + (newColors[i]! - startColors[i]!) * eased
        }

        posAttr.needsUpdate = true
        colorAttr.needsUpdate = true

        if (t < 1) requestAnimationFrame(tween)
      }
      requestAnimationFrame(tween)
    }
  }

  async function setSelected(index: number) {
    selected = index
    const sample = samples[index]
    if (!sample) return
    history.replaceState({}, '', `?${sample.slug}`)
    await loadData(sample.url)
  }

  let hoverScheduled = false
  let lastEvent: MouseEvent

  function onMouseMove(event: MouseEvent) {
    if (!points) return
    lastEvent = event

    if (hoverScheduled) return
    hoverScheduled = true

    requestAnimationFrame(() => {
      const rect = chartElement.getBoundingClientRect()
      mouse.set(
        ((lastEvent.clientX - rect.left) / rect.width) * 2 - 1,
        -((lastEvent.clientY - rect.top) / rect.height) * 2 + 1,
      )

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(points!)

      if (intersects.length > 0 && intersects[0]!.index != null) {
        tooltip.style.cssText = `left: ${lastEvent.clientX + 10}px; top: ${lastEvent.clientY + 10}px`
        tooltip.textContent = labels[intersects[0]!.index!] ?? ''
        tooltip.classList.add('visible')
      } else {
        tooltip.classList.remove('visible')
      }
      hoverScheduled = false
    })
  }

  $effect(() => {
    initScene()

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = chartElement.clientWidth / chartElement.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(chartElement.clientWidth, chartElement.clientHeight)
    })
    resizeObserver.observe(chartElement)

    chartElement.addEventListener('mousemove', onMouseMove)

    const params = new URLSearchParams(location.search)
    const slug = params.get('') || params.keys().next().value
    const index = slug ? samples.findIndex((s) => s.slug === slug) : -1
    if (index !== -1) selected = index

    const initialSample = samples[selected]
    if (initialSample) void loadData(initialSample.url)

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
      resizeObserver.disconnect()
      chartElement.removeEventListener('mousemove', onMouseMove)
      if (points) {
        points.geometry.dispose()
        ;(points.material as THREE.Material).dispose()
        points = null
      }
      circleTexture?.dispose()
      controls?.dispose()
      renderer?.dispose()
      if (renderer?.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  })
</script>

<div class="mb-6 flex flex-wrap justify-center gap-1">
  {#each samples as sample, i (sample.slug)}
    <button
      type="button"
      class="tab"
      class:tab-active={selected === i}
      aria-pressed={selected === i}
      onclick={() => setSelected(i)}
    >
      {sample.name}
    </button>
  {/each}
</div>

<div class="card chart-container bg-white shadow-md">
  <div bind:this={chartElement}></div>
</div>

<div bind:this={tooltip} class="tooltip" role="tooltip" aria-hidden="true"></div>

<style>
  .chart-container {
    height: calc(100dvh - 22rem);
    overflow: hidden;
    padding: 0;
    position: relative;
  }

  .chart-container > div {
    height: 100%;
    width: 100%;
  }

  .tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    pointer-events: none;
    z-index: 1000;
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.15s ease-out;
  }

  .tooltip:global(.visible) {
    opacity: 1;
    transition: opacity 0.05s ease-in;
  }
</style>
