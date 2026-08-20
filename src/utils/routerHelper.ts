/**
 * Checks if the current route is the /views admin page
 */
export function isViewsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return hash === '#/views' || hash === '#views' || path === '/views' || path === '/views/';
}

/**
 * Extracts snapshot ID from the current window location (hash or path)
 */
export function getSnapshotIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  if (isViewsAdminRoute()) return null;

  // 1. Check hash: #/v/55d65c0b-... or #/55d65c0b-...
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/#(?:(?:\/v\/)|\/)?([a-zA-Z0-9_-]{8,})/);
    if (match && match[1] && match[1] !== 'views') {
      return match[1];
    }
  }

  // 2. Check pathname: /v/55d65c0b-... or /55d65c0b-...
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/(?:^\/v\/|^\/)([a-f0-9-]{36})$/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  return null;
}

/**
 * Updates URL hash to point to a snapshot without reloading the page
 */
export function navigateToSnapshot(id: string): void {
  if (typeof window === 'undefined') return;
  const targetHash = `#/v/${id}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

/**
 * Navigates to the /views admin storage page
 */
export function navigateToViews(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash !== '#/views') {
    window.location.hash = '#/views';
  } else {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

/**
 * Navigates to the main table workspace
 */
export function navigateToHome(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash !== '#/' && window.location.hash !== '') {
    window.location.hash = '#/';
  } else {
    // If already on #/ or empty hash, dispatch event so router listeners re-evaluate
    window.location.hash = '#/';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

/**
 * Generates absolute shareable URL for a snapshot ID
 */
export function getSnapshotShareUrl(id: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/$/, '');
  return `${origin}${pathname}/#/v/${id}`;
}
