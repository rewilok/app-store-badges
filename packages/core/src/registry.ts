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
