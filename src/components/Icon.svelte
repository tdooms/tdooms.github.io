<script lang="ts">
  // Renders one of the chrome icons from `src/lib/icons.ts`. Used by both
  // the Astro Navbar (rendered server-side, no hydration) and the bae
  // InfoBar (inside the Svelte island). Single SVG source, identical output.
  import { icons, type IconName } from '../lib/icons'

  let { name, class: className = '' }: { name: IconName; class?: string } = $props()
  let icon = $derived(icons[name])
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {icon.width} {icon.height}"
  class={className}
  aria-hidden="true">{@html icon.body}</svg
>
