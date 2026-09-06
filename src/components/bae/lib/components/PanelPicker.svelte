<script lang="ts">
  let {
    panels,
    value = $bindable(),
  }: {
    panels: { id: string; label: string }[]
    value: string
  } = $props()
</script>

<div class="border-base-200 flex gap-1 border-b p-2" role="group" aria-label="Atlas panels">
  {#each panels as panel}
    <button
      type="button"
      class="btn btn-sm flex-1 border-transparent shadow-none {value === panel.id
        ? 'bg-base-200 text-base-content'
        : 'btn-ghost text-base-content/70'}"
      aria-pressed={value === panel.id}
      aria-controls={panel.id}
      onclick={() => (value = panel.id)}>{panel.label}</button
    >
  {/each}
</div>
