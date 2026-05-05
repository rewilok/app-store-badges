export type Theme = 'black' | 'white';

export type Product = 'app-store' | 'google-play';

export interface GetBadgeOptions {
  /**
   * BCP-47 locale tag. If omitted, the browser locale (`navigator.languages`)
   * is consulted; if still unresolved, `fallback` is used.
   */
  locale?: string;
  /** Fallback locale if the requested locale has no matching asset. Defaults to `'en'`. */
  fallback?: string;
  /** `'black'` (default) or `'white'`. Only the Apple badge ships a white variant. */
  theme?: Theme;
}

export interface ResolvedBadge {
  /** The locale key that was actually resolved (may differ from the requested one). */
  locale: string;
  /** Raw SVG markup, ready to inject. */
  svg: string;
}
