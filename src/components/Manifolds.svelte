<script lang="ts">
    import { onMount } from 'svelte';
    import { tableFromIPC } from 'apache-arrow';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

    type Sample = { name: string; url: string; slug: string };
    let { samples }: { samples: Sample[] } = $props();

    let selected = $state(0);
    let loading = $state(false);
    let chartElement: HTMLDivElement;
    let tooltip: HTMLDivElement;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let points: THREE.Points;
    let labels: string[] = [];
    let circleTexture: THREE.Texture;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Blue color gradient (6 stops)
    const COLORS = [
        [222, 235, 247], [158, 202, 225], [107, 174, 214],
        [66, 146, 198], [33, 113, 181], [8, 69, 148]
    ].map(([r, g, b]) => new THREE.Color(r / 255, g / 255, b / 255));

    function lerp(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
        return new THREE.Color().lerpColors(a, b, t);
    }

    function getColor(value: number): THREE.Color {
        const scaled = value * (COLORS.length - 1);
        const idx = Math.floor(scaled);
        const t = scaled - idx;
        return lerp(COLORS[idx], COLORS[Math.min(idx + 1, COLORS.length - 1)], t);
    }

    function initScene() {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(chartElement.clientWidth, chartElement.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        chartElement.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, chartElement.clientWidth / chartElement.clientHeight, 0.1, 100);
        camera.position.set(1.5, 1.5, 1.5);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0.3;
        controls.maxDistance = 8;

        // Origin marker
        scene.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        ));

        // Create reusable circle texture
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        circleTexture = new THREE.CanvasTexture(canvas);

        raycaster.params.Points.threshold = 0.02;
        requestAnimationFrame(function animate() {
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        });
    }

    async function loadData(url: string) {
        const table = tableFromIPC(await fetch(url).then(r => r.arrayBuffer()));
        const [x, y, z, values, tokens] = ['x', 'y', 'z', 'value', 'token']
            .map(col => table.getChild(col)!.toArray());

        // Normalize to [-1, 1] with uniform scaling
        const bounds = [x, y, z].map(arr => [Math.min(...arr), Math.max(...arr)]);
        const center = bounds.map(([min, max]) => (min + max) / 2);
        const scale = 2 / Math.max(...bounds.map(([min, max]) => max - min));

        const [minVal, maxVal] = [Math.min(...values), Math.max(...values)];
        const positions = new Float32Array(x.length * 3);
        const colors = new Float32Array(x.length * 3);
        labels = [];

        for (let i = 0; i < x.length; i++) {

            positions[i * 3] = (x[i] - center[0]) * scale;
            positions[i * 3 + 1] = (z[i] - center[2]) * scale;
            positions[i * 3 + 2] = (y[i] - center[1]) * scale;

            const color = getColor((values[i] - minVal) / (maxVal - minVal));
            colors.set([color.r, color.g, color.b], i * 3);
            labels.push(tokens[i] || 'Origin');
        }

        // Update origin position
        scene.children[0].position.set(-center[0] * scale, -center[2] * scale, -center[1] * scale);

        // Replace points
        if (points) {
            scene.remove(points);
            points.geometry.dispose();
            (points.material as THREE.Material).dispose();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 17,
            vertexColors: true,
            map: circleTexture,
            alphaTest: 0.5,
            depthTest: true,
            depthWrite: true,
            sizeAttenuation: false
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);
    }

    async function setSelected(index: number) {
        selected = index;
        loading = true;
        history.replaceState({}, '', `?${samples[index].slug}`);
        await loadData(samples[index].url);
        loading = false;
    }

    let hoverScheduled = false;
    let lastEvent: MouseEvent;

    function onMouseMove(event: MouseEvent) {
        if (!points) return;
        lastEvent = event;

        if (hoverScheduled) return;
        hoverScheduled = true;

        requestAnimationFrame(() => {
            const rect = chartElement.getBoundingClientRect();
            mouse.set(
                ((lastEvent.clientX - rect.left) / rect.width) * 2 - 1,
                -((lastEvent.clientY - rect.top) / rect.height) * 2 + 1
            );

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(points);

            if (intersects.length > 0) {
                tooltip.style.cssText = `left: ${lastEvent.clientX + 10}px; top: ${lastEvent.clientY + 10}px`;
                tooltip.textContent = labels[intersects[0].index!];
                tooltip.classList.add('visible');
            } else {
                tooltip.classList.remove('visible');
            }
            hoverScheduled = false;
        });
    }

    onMount(() => {
        initScene();

        const resizeObserver = new ResizeObserver(() => {
            camera.aspect = chartElement.clientWidth / chartElement.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(chartElement.clientWidth, chartElement.clientHeight);
        });
        resizeObserver.observe(chartElement);

        chartElement.addEventListener('mousemove', onMouseMove);

        const params = new URLSearchParams(location.search);
        const slug = params.get('') || params.keys().next().value;
        const index = slug ? samples.findIndex(s => s.slug === slug) : -1;
        if (index !== -1) selected = index;

        loadData(samples[selected].url);

        return () => {
            resizeObserver.disconnect();
            renderer.dispose();
            controls.dispose();
        };
    });
</script>

<div role="tablist" class="tabs tabs-box justify-center mb-6">
    {#each samples as sample, i}
        <button role="tab" class="tab" class:tab-active={selected === i} onclick={() => setSelected(i)}>
            {sample.name}
        </button>
    {/each}
</div>

<div class="card bg-white shadow-md chart-container">
    <div bind:this={chartElement} style="opacity: {loading ? 0.5 : 1}; transition: opacity 0.3s;"></div>
</div>

<div bind:this={tooltip} class="tooltip"></div>

<style>
    .chart-container {
        height: calc(100dvh - 350px);
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
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
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
