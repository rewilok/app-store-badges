// BCP-47 best-fit matcher tuned for app-store-badges.
//
// Input: a list of requested locales (e.g. ['pt-BR', 'pt', 'en'])
//        + the available locale keys (manifest keys).
//
// Returns the first available locale that matches any requested tag via:
//   1. exact case-insensitive match
//   2. normalized BCP-47 (language lowercased, region uppercased)
//   3. language-only fallback (pick the first available entry whose
//      language subtag matches, preferring a region-less tag, then the
//      language-region entry with the highest population default).

const LANGUAGE_REGION_PREF: Record<string, string[]> = {
  en: ['en', 'en-US', 'en-GB'],
  zh: ['zh-CN', 'zh-TW'],
  pt: ['pt-BR', 'pt-PT'],
  es: ['es', 'es-419', 'es-MX'],
  fr: ['fr', 'fr-CA'],
  he: ['he', 'he-IL'],
  sl: ['sl', 'sl-SI'],
  ar: ['ar', 'ar-SA'],
  hi: ['hi', 'hi-IN'],
  bn: ['bn', 'bn-IN'],
  gu: ['gu', 'gu-IN'],
  kn: ['kn', 'kn-IN'],
  ml: ['ml', 'ml-IN'],
  mr: ['mr', 'mr-IN'],
  or: ['or', 'or-IN'],
  pa: ['pa', 'pa-IN'],
  ta: ['ta', 'ta-IN'],
  te: ['te', 'te-IN'],
  ur: ['ur', 'ur-IN'],
  ca: ['ca', 'ca-ES'],
};

function normalize(tag: string): string {
  const parts = tag.trim().split(/[-_]/);
  if (parts.length === 0 || !parts[0]) return '';
  const lang = parts[0].toLowerCase();
  if (parts.length === 1) return lang;
  const region = parts[1]!.toUpperCase();
  return `${lang}-${region}`;
}

function languageOf(tag: string): string {
  const i = tag.indexOf('-');
  return i === -1 ? tag.toLowerCase() : tag.slice(0, i).toLowerCase();
}

/**
 * Pick the best available locale key for the requested candidate list.
 *
 * @param candidates  Requested tags in priority order (e.g. navigator.languages).
 * @param available   Set of manifest locale keys (BCP-47, case-preserved).
 * @returns The chosen key, or `undefined` if no candidate matches.
 */
export function matchLocale(
  candidates: readonly string[],
  available: ReadonlySet<string>,
): string | undefined {
  // Fast-path: case-insensitive exact match against the normalized candidate.
  const availArr = [...available];
  const availLower = new Map(availArr.map((k) => [k.toLowerCase(), k]));

  for (const raw of candidates) {
    if (!raw) continue;
    const norm = normalize(raw);
    if (!norm) continue;

    // 1. normalized exact match
    const hit = availLower.get(norm.toLowerCase());
    if (hit) return hit;

    // 2. language-only preference chain
    const lang = languageOf(norm);
    const preferred = LANGUAGE_REGION_PREF[lang];
    if (preferred) {
      for (const p of preferred) {
        const h = availLower.get(p.toLowerCase());
        if (h) return h;
      }
    }

    // 3. language-only: first available key whose language matches.
    //    Prefer a region-less key, then any region.
    const langMatches = availArr.filter((k) => languageOf(k) === lang);
    if (langMatches.length > 0) {
      const bare = langMatches.find((k) => !k.includes('-'));
      return bare ?? langMatches[0]!;
    }
  }

  return undefined;
}

/**
 * Build the candidate list.
 *
 * - If `requested` is provided, consult it then fall back to `fallback` / `'en'`.
 * - If `requested` is omitted, read `navigator.languages` (in order),
 *   then `fallback` / `'en'`.
 *
 * `navigator` is only consulted when no explicit locale is given — an explicit
 * request plus fallback should not be overridden by the user agent's locale.
 */
export function buildCandidates(
  requested: string | undefined,
  fallback: string | undefined,
): string[] {
  const list: string[] = [];
  const push = (v: string | undefined | null) => {
    if (v && !list.includes(v)) list.push(v);
  };

  if (requested) {
    push(requested);
  } else if (typeof navigator !== 'undefined') {
    const nav = navigator;
    if (Array.isArray(nav.languages)) {
      for (const l of nav.languages) push(l);
    } else if (typeof nav.language === 'string') {
      push(nav.language);
    }
  }

  push(fallback ?? 'en');
  push('en');
  return list;
}
