# Contributing

Thanks for your interest in contributing to `app-store-badges`. This guide covers the development workflow, the conventions we follow, and the steps for getting changes merged and released.

By participating in this project you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Prerequisites

- Node.js **18 or newer**
- pnpm **10** (the repo pins `packageManager` in `package.json`; `corepack enable` will pick up the right version)
- Git

## Repository layout

```
packages/
  core/      # @rewilok/app-store-badges — Web Components + registry
  react/     # @rewilok/app-store-badges-react
  vue/       # @rewilok/app-store-badges-vue
  angular/   # @rewilok/app-store-badges-angular
examples/    # consumer-side example apps
scripts/     # build helpers (asset processing, license sync)
```

The four `packages/*` directories are the publishable units. The framework wrappers (`react`, `vue`, `angular`) all depend on `core` via a workspace protocol.

## Setup

```sh
pnpm install
pnpm build:assets   # one-shot; processes vendor badge SVGs into packages/core/assets/
pnpm build
```

`build:assets` reads the raw vendor dumps (Apple/Google brand-resource downloads) extracted at the repo root and emits the locale-keyed asset tree under `packages/core/assets/`. You only need to run it again when refreshing the badge artwork.

### Refreshing badge artwork

1. Extract the Apple and Google vendor zips at the repo root, **keeping their original folder names and structure** (both are listed in `.gitignore`, so the raw dumps are not committed):

   ```
   Download-on-the-App-Store/
     AR/                                       # one folder per locale (mapped in scripts/build-assets.mjs)
       Download_on_App_Store/
         Black_lockup/
           SVG/Download_on_the_App_Store_Badge_AR_RGB_blk_102417.svg
           EPS/                                # non-SVG sibling — skipped by the build
         White_lockup/
           SVG/…wht….svg
           EPS/                                # skipped
     …                                         # remaining locale folders follow the same shape

   Get it on Google Play Badges/
     Digital/
       svg/
         GetItOnGooglePlay_Badge_Web_color_Afrikaans.svg   # one flat file per language
         …
   ```

   The build only reads `*.svg` files — `EPS/` and any other non-SVG siblings are ignored. A handful of older Apple locales ship as `Preferred_Badge`/`Alternative_Badge` instead of `Black_lockup`/`White_lockup`; the script detects both shapes automatically.
2. Run `pnpm build:assets`.
3. Inspect the diff under `packages/core/assets/` and `packages/core/src/generated/` — committed asset changes should be reviewed for unintended visual or naming drift.
4. Regenerate the build (`pnpm build`) and run the test suite.

### Common scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Build every package via its own `build` script |
| `pnpm build:assets` | Process vendor dumps into `packages/core/assets/` |
| `pnpm typecheck` | Type-check every package |
| `pnpm test` | Run unit tests (currently `vitest` in `core`) |
| `pnpm clean` | Remove every package's `dist` directory |

## Making changes

1. Open an issue first for non-trivial changes so we can align on scope.
2. Branch from the default branch using a descriptive name (e.g. `feat/locale-resolution-fallback`, `fix/svg-aria-label`).
3. Keep PRs focused — one concern per PR.
4. Update or add tests for behaviour changes. The `core` package uses `vitest`.
5. Update the relevant README(s) when public API or usage changes.
6. **Add a changeset** for any user-visible change (see below).

### Locale specifiers

Region-specific locale tags (`pt-BR`, `sl-SI`, `he-IL`, etc.) are kept as distinct BCP-47 variants throughout the registry. **Do not collapse them to language-only keys.** The variants exist because vendor badge artwork is published per locale and the visual rendering can differ.

### Brand-guideline impact

Changes that touch the badge artwork, the rendered DOM, default sizing, accessible labels, or anything else that affects how the badges are *displayed* must be checked against the upstream brand guidelines linked from the [root README](./README.md#legal-attribution-required). Note any such impact in the PR description so reviewers can confirm.

## Releases (Changesets)

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs across the four published packages.

When you make a user-visible change:

```sh
pnpm changeset
```

Pick the affected package(s), choose the bump level (patch / minor / major), and write a one-line summary. The CLI writes a small markdown file under `.changeset/` — commit it with your PR.

If your change is internal-only (refactors, build tweaks, docs), you do not need a changeset, but it is fine to add an empty one (`pnpm changeset --empty`) for traceability.

### Cutting a release

Releases are automated by the `Release` GitHub Actions workflow:

1. Merge PRs that contain `.changeset/*.md` files into `main`.
2. The workflow opens (or updates) a **"chore: release"** PR that consumes the queued changesets, bumps versions, rewrites `workspace:*` references, and regenerates per-package `CHANGELOG.md`. Review the diff.
3. Merging that PR triggers the workflow again, which runs `pnpm build` and `changeset publish` — pushing every bumped package to npm with provenance.

If you ever need to publish from a local machine (e.g. recovering from a CI outage), the equivalent commands are:

```sh
pnpm version-packages   # consume changesets, bump versions, regenerate per-package CHANGELOG.md
git commit -am "chore: release"
pnpm release            # build + changeset publish to npm
```

`pnpm release` runs `pnpm build` first so we never publish an artifact that hasn't been re-built from the bumped sources.

## Reporting bugs and security issues

- Functional bugs and feature requests: open a GitHub issue using the templates.
- Security vulnerabilities: see [`SECURITY.md`](./SECURITY.md) — please **do not** file these as public issues.
