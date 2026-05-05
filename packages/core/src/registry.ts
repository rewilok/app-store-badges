import type { GetBadgeOptions, Product, ResolvedBadge, Theme } from './types.js';
import { appStoreBlack, appStoreWhite, googlePlayBlack, type LocaleMap } from './generated/manifest.js';
import { buildCandidates, matchLocale } from './locale-match.js';

export type { GetBadgeOptions, Product, ResolvedBadge, Theme } from './types.js';

function mapFor(product: Product, theme: Theme): LocaleMap {
  if (product === 'app-store') {
    return theme === 'white' ? appStoreWhite : appStoreBlack;
  }
  // google-play currently ships only the black variant.
  return googlePlayBlack;
}

const localeSetCache = new WeakMap<LocaleMap, ReadonlySet<string>>();
function localeSet(map: LocaleMap): ReadonlySet<string> {
  let s = localeSetCache.get(map);
  if (!s) {
    s = new Set(Object.keys(map));
    localeSetCache.set(map, s);
  }
  return s;
}

/**
 * Resolve which locale key will be used for a given product / theme / request.
 *
 * Order of preference:
 *   1. The explicit `locale` argument (if matchable).
 *   2. `navigator.languages` (or `navigator.language`), in order.
 *   3. The `fallback` argument (default `'en'`).
 *   4. `'en'` as a last resort.
 *
 * Throws if none of the candidates resolve (should be impossible because
 * every product/theme ships an `en` or `en-US` asset).
 */
export function resolveLocale(
  product: Product,
  requested?: string,
  fallback?: string,
  theme: Theme = 'black',
): string {
  const map = mapFor(product, theme);
  const available = localeSet(map);
  const candidates = buildCandidates(requested, fallback);
  const hit = matchLocale(candidates, available);
  if (hit) return hit;
  throw new Error(
    `[app-store-badges] No locale match for product=${product} theme=${theme}. ` +
      `Tried: ${candidates.join(', ')}`,
  );
}

/** All available locale keys for a given product/theme. */
export function listLocales(product: Product, theme: Theme = 'black'): readonly string[] {
  return Object.keys(mapFor(product, theme));
}

/** Load the SVG for the best-matching locale. */
export async function getBadge(
  product: Product,
  options: GetBadgeOptions = {},
): Promise<ResolvedBadge> {
  const theme = options.theme ?? 'black';
  const locale = resolveLocale(product, options.locale, options.fallback, theme);
  const map = mapFor(product, theme);
  const loader = map[locale]!;
  const mod = await loader();
  return { locale, svg: mod.default };
}

const SVG_OPEN_RE = /<svg\b([^>]*)>/;
const HAS_STYLE = /\sstyle\s*=/i;

/**
 * Inject a presentation `style` on the root `<svg>` so it fills its container
 * at a consistent height regardless of the source asset's intrinsic
 * dimensions. Intended for framework wrappers that inline the SVG via
 * `innerHTML` (where shadow-DOM / scoped CSS can't reach). Idempotent — a
 * no-op when the root `<svg>` already carries a `style=` attribute.
 */
export function withDefaultBadgeStyle(svg: string): string {
  const m = svg.match(SVG_OPEN_RE);
  const attrs = m?.[1];
  if (attrs === undefined) return svg;
  if (HAS_STYLE.test(attrs)) return svg;
  return svg.replace(SVG_OPEN_RE, `<svg style="display:block;height:100%;width:auto"${attrs}>`);
}
