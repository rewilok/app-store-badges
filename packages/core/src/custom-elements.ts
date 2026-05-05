import { AppStoreBadgeElement } from './app-store-badge.js';
import { GooglePlayBadgeElement } from './google-play-badge.js';

export { AppStoreBadgeElement, GooglePlayBadgeElement };

/**
 * Register both custom elements. Safe to call multiple times.
 * This function has no side effect at import time — only when called.
 * The `/elements` subpath calls it automatically; the default entry does not.
 */
export function defineCustomElements(): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get('app-store-badge')) {
    customElements.define('app-store-badge', AppStoreBadgeElement);
  }
  if (!customElements.get('google-play-badge')) {
    customElements.define('google-play-badge', GooglePlayBadgeElement);
  }
}
