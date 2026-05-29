<script>
  import "../styles/global.css";
  import { focusSearch } from "$lib/searchFocus";
  import InfoBar from "$lib/components/InfoBar.svelte";

  let { children } = $props();

  // No View Transitions: the API snapshots both views at fixed times, but our
  // /composite route's WebGL canvas takes a few RAFs to paint after mount.
  // Snapshotting too early flickers (transparent canvas in the new snapshot);
  // waiting longer trips the browser's transition timeout. Plain instant
  // swap is the right call for this workload — Manifold's own composite-swap
  // tween already covers composite-to-composite.

  // App-level keyboard shortcuts. ⌘K / Ctrl+K from anywhere; "/" only when
  // not already typing in a field. The actual focus call lives in
  // ``InfoBar.svelte`` (the chrome owns its input); we just dispatch.
  $effect(() => {
    const onKey = (e) => {
      const inField = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); focusSearch();
      } else if (e.key === "/" && !inField) {
        e.preventDefault(); focusSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

<InfoBar />
<main class="flex-1 min-h-0">
  {@render children()}
</main>
