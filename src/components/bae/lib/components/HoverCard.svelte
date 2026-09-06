<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte'

  // Native popovers provide keyboard activation, Escape and outside-click
  // dismissal, and escape the scrolling panels that contain their triggers.
  // Children must be non-interactive phrasing content inside the real button.
  let {
    children,
    tip,
    label,
    side = 'bottom',
    align = 'center',
    width = 'w-72',
  }: {
    children: Snippet
    tip: Snippet
    label?: string
    side?: 'top' | 'bottom'
    align?: 'start' | 'center' | 'end'
    width?: string
  } = $props()

  const id = $props.id()
  let trigger: HTMLButtonElement
  let popup: HTMLDivElement
  let open = $state(false)
  let openedByHover = false
  let closeTimer: ReturnType<typeof setTimeout> | undefined

  const cancelClose = () => clearTimeout(closeTimer)
  onDestroy(cancelClose)

  function enter(event: PointerEvent) {
    cancelClose()
    if (event.pointerType === 'touch' || popup.matches(':popover-open')) return
    openedByHover = true
    popup.showPopover()
  }

  function leave() {
    cancelClose()
    // Allow the pointer to cross the gap between the trigger and the card.
    if (openedByHover) closeTimer = setTimeout(() => popup.hidePopover(), 150)
  }

  function activate(event: MouseEvent) {
    if (openedByHover && popup.matches(':popover-open')) {
      // Clicking a preview keeps it open; subsequent clicks toggle normally.
      event.preventDefault()
      openedByHover = false
      cancelClose()
    }
  }

  function position() {
    if (!popup.matches(':popover-open')) return
    const anchor = trigger.getBoundingClientRect()
    const box = popup.getBoundingClientRect()
    const left =
      align === 'start'
        ? anchor.left
        : align === 'end'
          ? anchor.right - box.width
          : anchor.left + (anchor.width - box.width) / 2
    const top = side === 'top' ? anchor.top - box.height - 8 : anchor.bottom + 8
    popup.style.left = `${Math.max(8, Math.min(left, innerWidth - box.width - 8))}px`
    popup.style.top = `${Math.max(8, Math.min(top, innerHeight - box.height - 8))}px`
    popup.style.visibility = 'visible'
  }

  function beforeToggle(event: ToggleEvent) {
    open = event.newState === 'open'
    if (open) {
      // The native toggle event can arrive after the first paint. Measure the
      // opened card before painting it, including on keyboard/touch activation.
      popup.style.visibility = 'hidden'
      requestAnimationFrame(position)
    } else {
      openedByHover = false
      cancelClose()
    }
  }

  $effect(() => {
    if (!open) return
    // A deferred equation or font can change an already open card's size.
    const observer = new ResizeObserver(position)
    observer.observe(popup)
    window.addEventListener('resize', position)
    document.addEventListener('scroll', position, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', position)
      document.removeEventListener('scroll', position, true)
    }
  })
</script>

<button
  bind:this={trigger}
  type="button"
  popovertarget={id}
  aria-label={label}
  aria-describedby={id}
  onpointerenter={enter}
  onpointerleave={leave}
  onclick={activate}
  class="hover:text-primary focus-visible:outline-primary inline-flex min-h-8 cursor-help items-center rounded-sm text-inherit focus-visible:outline-2 focus-visible:outline-offset-2"
>
  {@render children()}
</button>
<div
  bind:this={popup}
  {id}
  popover="auto"
  role="tooltip"
  onbeforetoggle={beforeToggle}
  onpointerenter={cancelClose}
  onpointerleave={leave}
  class="bg-base-100 text-base-content border-base-300 fixed inset-auto m-0 max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] overflow-auto rounded-xl border p-4 text-left shadow-lg {width}"
>
  <div class="flex flex-col gap-3 text-sm font-normal tracking-normal normal-case">
    {@render tip()}
  </div>
</div>
