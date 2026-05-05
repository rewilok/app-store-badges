import { getBadge } from './registry.js';
import type { Product, Theme } from './types.js';

const SHARED_STYLE = `
:host { display: inline-block; line-height: 0; }
:host([hidden]) { display: none; }
a { display: inline-block; line-height: 0; color: inherit; text-decoration: none; }
svg { display: block; width: 100%; height: auto; }
`;

const DEFAULT_LABELS: Record<Product, string> = {
  'app-store': 'Download on the App Store',
  'google-play': 'Get it on Google Play',
};

/**
 * Shared base for `<app-store-badge>` and `<google-play-badge>`.
 * Reads `locale` / `fallback` / `theme` / `href` attributes and re-renders
 * on change. Uses an open shadow root for style isolation.
 */
export abstract class BadgeElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['locale', 'fallback', 'theme', 'href', 'target', 'rel', 'aria-label'];
  }

  protected abstract readonly product: Product;
  /** Whitelist of allowed themes for this product. */
  protected readonly allowedThemes: readonly Theme[] = ['black', 'white'];

  /** Resolves each render to cancel stale loads when attributes churn. */
  private renderToken = 0;
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.scheduleRender();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.scheduleRender();
  }

  private scheduleRender(): void {
    const token = ++this.renderToken;
    this.render(token).catch((err) => {
      // Surface errors but don't crash the page.
      console.error('[app-store-badges] render failed', err);
    });
  }

  private async render(token: number): Promise<void> {
    const locale = this.getAttribute('locale') ?? undefined;
    const fallback = this.getAttribute('fallback') ?? undefined;
    const themeAttr = this.getAttribute('theme');
    const theme: Theme = this.allowedThemes.includes(themeAttr as Theme)
      ? (themeAttr as Theme)
      : 'black';

    const { svg } = await getBadge(this.product, { locale, fallback, theme });
    if (token !== this.renderToken) return; // stale

    const href = this.getAttribute('href');
    const target = this.getAttribute('target') ?? (href ? '_blank' : null);
    const rel = this.getAttribute('rel') ?? (href ? 'noopener noreferrer' : null);
    const ariaLabel = this.getAttribute('aria-label') ?? DEFAULT_LABELS[this.product];

    const wrapAttrs = (role: 'a' | 'span') => {
      if (role === 'a') {
        const parts = [
          `href="${escapeAttr(href!)}"`,
          target ? `target="${escapeAttr(target)}"` : '',
          rel ? `rel="${escapeAttr(rel)}"` : '',
          `aria-label="${escapeAttr(ariaLabel)}"`,
        ].filter(Boolean);
        return parts.join(' ');
      }
      return `role="img" aria-label="${escapeAttr(ariaLabel)}"`;
    };

    const inner = href
      ? `<a ${wrapAttrs('a')}>${svg}</a>`
      : `<span ${wrapAttrs('span')}>${svg}</span>`;

    this.root.innerHTML = `<style>${SHARED_STYLE}</style>${inner}`;
  }
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
