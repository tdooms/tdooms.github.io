// Single-slot registry so the global ⌘K / "/" keyboard handler in
// ``+layout.svelte`` (app-level concern) can focus the search input owned by
// ``InfoBar.svelte`` (chrome-level concern) without the parent reaching into
// the child's internals. The InfoBar registers a focus closure; the layout
// invokes it. One slot — InfoBar is a singleton in the chrome.

let focusFn: (() => void) | null = null;

export const registerSearchFocus = (fn: () => void): void => {
  focusFn = fn;
};

export const focusSearch = (): void => {
  focusFn?.();
};
