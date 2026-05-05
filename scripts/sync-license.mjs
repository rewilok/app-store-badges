#!/usr/bin/env node
// Copies the canonical LICENSE and NOTICE from the repo root into every
// `packages/*/` directory so each published tarball ships them at its root.
// Run automatically as `prepublishOnly` per package; safe to run anytime.

import { copyFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const FILES = ['LICENSE', 'NOTICE'];

for (const file of FILES) {
  if (!existsSync(join(ROOT, file))) {
    throw new Error(`Missing ${file} at repo root: ${join(ROOT, file)}`);
  }
}

const packages = readdirSync(PACKAGES_DIR).filter((name) =>
  statSync(join(PACKAGES_DIR, name)).isDirectory(),
);

for (const pkg of packages) {
  for (const file of FILES) {
    copyFileSync(join(ROOT, file), join(PACKAGES_DIR, pkg, file));
  }
  console.log(`synced LICENSE + NOTICE → packages/${pkg}/`);
}
