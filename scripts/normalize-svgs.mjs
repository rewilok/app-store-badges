#!/usr/bin/env node
// Walks packages/core/assets/**/*.svg and applies the same transforms that
// scripts/build-assets.mjs runs on freshly-vendored input:
//   1. minify (strip xml decl, comments, <title>, inter-tag whitespace)
//   2. drop root <svg> width/height so sizing is wrapper-driven only
// Idempotent: re-running is a no-op once everything is normalized.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifySvg } from './lib/minify-svg.mjs';
import { stripRootSvgSize } from './lib/strip-root-svg-size.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_ROOT = resolve(__dirname, '../packages/core/assets');

function* walkSvgs(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walkSvgs(p);
    else if (s.isFile() && name.toLowerCase().endsWith('.svg')) yield p;
  }
}

let scanned = 0;
let changed = 0;
let bytesBefore = 0;
let bytesAfter = 0;
for (const file of walkSvgs(ASSETS_ROOT)) {
  scanned++;
  const before = readFileSync(file, 'utf8');
  const after = stripRootSvgSize(minifySvg(before));
  bytesBefore += Buffer.byteLength(before);
  bytesAfter += Buffer.byteLength(after);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

const saved = bytesBefore - bytesAfter;
const pct = bytesBefore === 0 ? 0 : ((saved / bytesBefore) * 100).toFixed(1);
console.log(`changed: ${changed} / scanned: ${scanned}`);
console.log(`bytes: ${bytesBefore} -> ${bytesAfter} (saved ${saved}, ${pct}%)`);
