#!/usr/bin/env node
// Processes the vendor-provided badge dumps into the core package's
// `assets/` tree and emits a deterministic locale manifest.
//
// Usage:  node scripts/build-assets.mjs
//
// Reads from the extracted vendor folders at the repo root (kept untracked
// via .gitignore). The source folders are left in place after the run.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifySvg } from './lib/minify-svg.mjs';
import { stripRootSvgSize } from './lib/strip-root-svg-size.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APPLE_SRC = join(ROOT, 'Download-on-the-App-Store');
const GOOGLE_SRC = join(ROOT, 'Get it on Google Play Badges/Digital/svg');
const CORE = join(ROOT, 'packages/core');
const ASSETS_OUT = join(CORE, 'assets');
const MANIFEST_OUT = join(CORE, 'src/generated/manifest.ts');

// ─── Locale maps ────────────────────────────────────────────────────────────

/** Apple top-level folder name → BCP-47 tag. Every region specifier preserved. */
const APPLE_MAP = {
  'US': 'en-US',
  'DE': 'de',
  'FR': 'fr',
  'FRCA': 'fr-CA',
  'CAES': 'ca-ES',
  'ES': 'es',
  'ESMX': 'es-MX',
  'PTBR': 'pt-BR',
  'PTPT': 'pt-PT',
  'IT': 'it',
  'NL': 'nl',
  'DK': 'da',
  'SE': 'sv',
  'NO': 'no',
  'FI': 'fi',
  'PL': 'pl',
  'CZ': 'cs',
  'SK': 'sk',
  'HU': 'hu',
  'RO': 'ro',
  'BG': 'bg',
  'HR': 'hr',
  'SI': 'sl',
  'SL-SL': 'sl-SI',
  'EE': 'et',
  'LV': 'lv',
  'LT': 'lt',
  'UA': 'uk',
  'RU': 'ru',
  'GR': 'el',
  'MT': 'mt',
  'TR': 'tr',
  'AZ': 'az',
  'IL': 'he-IL',
  'HB': 'he',
  'AR': 'ar',
  'JP': 'ja',
  'KR': 'ko',
  'CN(SC)': 'zh-CN',
  'HKTW(TC)': 'zh-TW',
  'TH': 'th',
  'VN': 'vi',
  'ID': 'id',
  'MY': 'ms',
  'PH': 'fil',
  'IN': 'hi-IN',
  'IN-BN': 'bn-IN',
  'IN-GU': 'gu-IN',
  'IN-KN': 'kn-IN',
  'IN-ML': 'ml-IN',
  'IN-MR': 'mr-IN',
  'IN-OR': 'or-IN',
  'IN-PA': 'pa-IN',
  'IN-TA': 'ta-IN',
  'IN-TE': 'te-IN',
  'IN-UR': 'ur-IN',
};

/** Google filename language token → BCP-47 tag. */
const GOOGLE_MAP = {
  'English': 'en',
  'German': 'de',
  'French': 'fr',
  'French-CA': 'fr-CA',
  'Spanish': 'es',
  'Spanish-LATAM': 'es-419',
  'Portuguese-Brazil': 'pt-BR',
  'Portuguese-Portugal': 'pt-PT',
  'Italian': 'it',
  'Dutch': 'nl',
  'Danish': 'da',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Finnish': 'fi',
  'Icelandic': 'is',
  'Polish': 'pl',
  'Czech': 'cs',
  'Slovak': 'sk',
  'Slovenian': 'sl',
  'Hungarian': 'hu',
  'Romanian': 'ro',
  'Bulgarian': 'bg',
  'Croatian': 'hr',
  'Bosnian': 'bs',
  'Serbian': 'sr',
  'Macedonian': 'mk',
  'Albanian': 'sq',
  'Greek': 'el',
  'Estonian': 'et',
  'Latvian': 'lv',
  'Lithuanian': 'lt',
  'Ukranian': 'uk',
  'Russian': 'ru',
  'Belarusian': 'be',
  'Turkish': 'tr',
  'Azerbaijani': 'az',
  'Armenian': 'hy',
  'Georgian': 'ka',
  'Hebrew': 'he',
  'Arabic-Saudi-Arabia': 'ar-SA',
  'Persian': 'fa',
  'Urdu': 'ur',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Chinese-China': 'zh-CN',
  'Chinese-Taiwan': 'zh-TW',
  'Thai': 'th',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malaysian': 'ms',
  'Filipino': 'fil',
  'Khmer': 'km',
  'Lao': 'lo',
  'Burmese': 'my',
  'Mongolian': 'mn',
  'Kazakh': 'kk',
  'Kyrgyz': 'ky',
  'Uzbek': 'uz',
  'Hindi': 'hi',
  'Bengali': 'bn',
  'Gujarati': 'gu',
  'Kannada': 'kn',
  'Malayalam': 'ml',
  'Marathi': 'mr',
  'Nepali': 'ne',
  'Punjabi': 'pa',
  'Sinhalese': 'si',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Afrikaans': 'af',
  'Basque': 'eu',
  'Catalan': 'ca',
  'Galician': 'gl',
  'Irish': 'ga',
  'Swahili': 'sw',
  'Zulu': 'zu',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function findSvg(dir, predicate) {
  if (!existsSync(dir)) return null;
  const entries = readdirSync(dir);
  for (const name of entries) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      const found = findSvg(p, predicate);
      if (found) return found;
    } else if (s.isFile() && name.toLowerCase().endsWith('.svg') && predicate(name)) {
      return p;
    }
  }
  return null;
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function writeSvg(srcPath, outPath) {
  const raw = readFileSync(srcPath, 'utf8');
  ensureDir(dirname(outPath));
  writeFileSync(outPath, stripRootSvgSize(minifySvg(raw)));
}

// ─── Apple ──────────────────────────────────────────────────────────────────

function processApple() {
  const folders = readdirSync(APPLE_SRC).filter((n) => {
    const p = join(APPLE_SRC, n);
    return statSync(p).isDirectory();
  });

  const black = new Map(); // locale → path
  const white = new Map();

  for (const folder of folders) {
    const locale = APPLE_MAP[folder];
    if (!locale) {
      console.warn(`[apple] Unmapped folder: ${folder} — skipping`);
      continue;
    }
    const base = join(APPLE_SRC, folder);

    // Shape 1: {LOC}/Download_on_App_Store/{Black|White}_lockup/SVG/*.svg
    // Shape 2: {LOC}/{Black|White}_lockup/SVG/*.svg
    // Shape 3: {LOC}/{Preferred|Alternative}_Badge/SVG/*Blk|*Wht*.svg
    const blkPath =
      findSvg(join(base, 'Download_on_App_Store/Black_lockup'), () => true) ??
      findSvg(join(base, 'Black_lockup'), () => true) ??
      findSvg(join(base, 'Preferred_Badge'), (n) => /Blk/i.test(n));
    const whtPath =
      findSvg(join(base, 'Download_on_App_Store/White_lockup'), () => true) ??
      findSvg(join(base, 'White_lockup'), () => true) ??
      findSvg(join(base, 'Alternative_Badge'), (n) => /Wht/i.test(n));

    if (blkPath) black.set(locale, blkPath);
    else console.warn(`[apple] No black SVG for ${folder}`);
    if (whtPath) white.set(locale, whtPath);
    else console.warn(`[apple] No white SVG for ${folder}`);
  }

  for (const [locale, src] of black) {
    writeSvg(src, join(ASSETS_OUT, 'app_store_badge/black', `${locale}.svg`));
  }
  for (const [locale, src] of white) {
    writeSvg(src, join(ASSETS_OUT, 'app_store_badge/white', `${locale}.svg`));
  }

  return { black: [...black.keys()].sort(), white: [...white.keys()].sort() };
}

// ─── Google ─────────────────────────────────────────────────────────────────

function processGoogle() {
  const files = readdirSync(GOOGLE_SRC).filter((n) => n.toLowerCase().endsWith('.svg'));
  const pattern = /^GetItOnGooglePlay_Badge_Web(?:_color)?_(.+)\.svg$/i;
  const black = new Map();

  for (const file of files) {
    const m = file.match(pattern);
    if (!m) {
      console.warn(`[google] Filename did not match pattern: ${file}`);
      continue;
    }
    const raw = m[1];
    if (raw === 'Finnish-01') continue; // orphaned duplicate
    const locale = GOOGLE_MAP[raw];
    if (!locale) {
      console.warn(`[google] Unmapped language: ${raw}`);
      continue;
    }
    black.set(locale, join(GOOGLE_SRC, file));
  }

  for (const [locale, src] of black) {
    writeSvg(src, join(ASSETS_OUT, 'google_play_badge/black', `${locale}.svg`));
  }

  return { black: [...black.keys()].sort() };
}

// ─── Manifest emission ──────────────────────────────────────────────────────

function emitManifest(apple, google) {
  const header = `// AUTO-GENERATED by scripts/build-assets.mjs — do not edit by hand.
// Each loader returns a module whose default export is the raw SVG string
// (tsup is configured with loader: { '.svg': 'text' }).

export type LocaleLoader = () => Promise<{ default: string }>;
export type LocaleMap = Readonly<Record<string, LocaleLoader>>;

`;
  const toMap = (keys, product, theme) => {
    const entries = keys
      .map((k) => `  ${JSON.stringify(k)}: () => import('../../assets/${product}/${theme}/${k}.svg'),`)
      .join('\n');
    return `{\n${entries}\n}`;
  };

  const body = `export const appStoreBlack: LocaleMap = ${toMap(apple.black, 'app_store_badge', 'black')};

export const appStoreWhite: LocaleMap = ${toMap(apple.white, 'app_store_badge', 'white')};

export const googlePlayBlack: LocaleMap = ${toMap(google.black, 'google_play_badge', 'black')};
`;

  ensureDir(dirname(MANIFEST_OUT));
  writeFileSync(MANIFEST_OUT, header + body);
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(APPLE_SRC) && !existsSync(GOOGLE_SRC)) {
    console.error(
      'No vendor source folders found at repo root. Expected `Download-on-the-App-Store/` and/or `Get it on Google Play Badges/`. Nothing to do.',
    );
    process.exit(1);
  }

  // Clean previous assets so removed locales don't linger.
  rmSync(ASSETS_OUT, { recursive: true, force: true });

  const apple = processApple();
  const google = processGoogle();

  emitManifest(apple, google);

  const summary = {
    'app-store/black': apple.black.length,
    'app-store/white': apple.white.length,
    'google-play/black': google.black.length,
  };
  console.log('Asset build complete:');
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v} locales`);

  // Sanity: `en` must exist in every product/theme or the resolver breaks.
  const hasEn = (arr) => arr.includes('en') || arr.includes('en-US');
  if (!hasEn(apple.black) || !hasEn(apple.white) || !hasEn(google.black)) {
    console.error('FATAL: an `en`/`en-US` asset is missing from one of the products.');
    process.exit(2);
  }
}

main();
