<script>
	import { onMount } from 'svelte';

	let currentPath = $state('');
	let mobileMenuOpen = $state(false);

	onMount(() => {
		// Normalize path: remove trailing slash except for root
		const raw = window.location.pathname;
		currentPath = raw.replace(/\/$/, '') || '/';
	});

	// Reactive function that checks if a tab is active
	const isActive = (href) => {
		const normalized = href.replace(/\/$/, '') || '/';
		// For root path, exact match only
		if (normalized === '/') {
			return currentPath === '/';
		}
		// For other paths, match if current path starts with the tab path
		return currentPath === normalized || currentPath.startsWith(normalized + '/');
	};

	const tabs = [
		{ href: '/research', label: 'Research', icon: 'fas fa-atom' },
		{ href: '/demos', label: 'Demos', icon: 'fas fa-flask' },
		{ href: '/blog', label: 'Blog', icon: 'fas fa-fire' },
		{ href: '/resume', label: 'Resume', icon: 'fas fa-file-alt' }
	];

	const closeMobileMenu = () => {
		mobileMenuOpen = false;
	};
</script>

<style>
	/* Active tab should cover the navbar bottom border */
	.tab-active {
		border-bottom: 2px solid oklch(var(--b1));
		margin-bottom: -1px;
		position: relative;
		z-index: 1;
	}

	/* Mobile menu styles */
	.mobile-menu-item {
		font-size: 1.25rem;
		padding: 1rem;
		transition: background-color 0.2s;
	}

	.mobile-menu-item:hover {
		background-color: oklch(var(--b2));
	}

	.mobile-menu-item.active {
		background-color: oklch(var(--b2));
		font-weight: 600;
	}
</style>

<!-- Mobile Navbar -->
<div class="lg:hidden bg-base-100 border-b border-base-300">
	<div class="navbar px-4">
		<div class="flex-1">
			<a href="/" class="text-2xl font-bold">tdooms</a>
		</div>
		<div class="flex-none">
			<button 
				class="btn btn-square btn-ghost"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Toggle menu"
			>
				<i class="fas fa-bars text-xl"></i>
			</button>
		</div>
	</div>

	<!-- Mobile Dropdown Menu -->
	{#if mobileMenuOpen}
		<div class="bg-base-100 border-t border-base-300">
			{#each tabs as tab}
				<a
					href={tab.href}
					class="mobile-menu-item block {isActive(tab.href) ? 'active' : ''}"
					onclick={closeMobileMenu}
				>
					<i class="{tab.icon} mr-3"></i>
					{tab.label}
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- Desktop Navbar -->
<div class="hidden lg:block bg-base-100 border-b border-base-300">
	<div class="container mx-auto w-full px-4 pt-4">
		<div class="flex items-baseline justify-center w-full">
			<div role="tablist" class="tabs tabs-lift tabs-lg -mb-px">
				{#each tabs.slice(0, 2) as tab}
					<a
						href={tab.href}
						role="tab"
						class="tab {isActive(tab.href) ? 'tab-active font-semibold' : ''}"
					>
						<i class="{tab.icon} mr-2"></i>
						{tab.label}
					</a>
				{/each}

				<a 
					href="/" 
					class="px-6 text-3xl no-underline hover:scale-105 transition-transform font-bold"
				>
					tdooms
				</a>

				{#each tabs.slice(2) as tab}
					<a
						href={tab.href}
						role="tab"
						class="tab {isActive(tab.href) ? 'tab-active font-semibold' : ''}"
					>
						<i class="{tab.icon} mr-2"></i>
						{tab.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
