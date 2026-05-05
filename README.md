# app-store-badges

Cross-framework, tree-shakeable component library for the official **App Store** and **Google Play** badges, with locale-aware asset selection.

## Packages

| Package | Framework | Status |
| --- | --- | --- |
| [`@rewilok/app-store-badges`](packages/core) | Web Components + registry | v0.1.0 |
| [`@rewilok/app-store-badges-react`](packages/react) | React 17+ | v0.1.0 |
| [`@rewilok/app-store-badges-vue`](packages/vue) | Vue 3.3+ | v0.1.0 |
| [`@rewilok/app-store-badges-angular`](packages/angular) | Angular 16+ | v0.1.0 |

## Quick start

```tsx
// React
import { AppStoreBadge, GooglePlayBadge } from '@rewilok/app-store-badges-react';

<AppStoreBadge locale="de" href="https://apps.apple.com/…" />
<GooglePlayBadge fallback="en" href="https://play.google.com/…" />
```

```html
<!-- Vanilla / Web Components -->
<script type="module">
  import '@rewilok/app-store-badges/elements';
</script>
<app-store-badge locale="fr-CA" theme="white"></app-store-badge>
<google-play-badge></google-play-badge>
```

If `locale` is omitted, the component consults `navigator.languages`. If no match is found, it uses `fallback` (default `"en"`).

## Legal attribution (required)

Use of the App Store and Google Play badges is governed by Apple's and Google's brand guidelines. If you ship these badges in your product, you are responsible for complying with both — this library does not exempt you from those terms. At minimum, you must:

- Display the badges unmodified (no recoloring, cropping, rotating, or resizing below the published minimums).
- Respect the required clear space around each badge.
- Include the trademark attributions shown below in your product's "About", "Credits", or legal page wherever the badges appear.

Primary sources — read these before shipping:

- Apple — [Marketing Resources and Identity Guidelines for the App Store](https://developer.apple.com/app-store/marketing/guidelines/)
- Apple — [App Store Badge Guidelines (PDF)](https://developer.apple.com/app-store/marketing/guidelines/#downloadOnAppStore)
- Google — [Brand guidelines for the Google Play badge](https://play.google.com/intl/en_us/badges/)
- Google — [Partner Marketing Hub: Google Play badge usage](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge/)

## Development

```sh
pnpm install
pnpm build:assets   # one-shot; processes _temp_* vendor dumps into packages/core/assets/
pnpm build
```

## License and trademarks

The code in this repository is licensed under the [Apache License 2.0](./LICENSE). The badge artwork is **not** covered by that license — it remains the property of Apple Inc. and Google LLC respectively, and is redistributed under each company's published brand guidelines. Trademark attributions and third-party notices live in [`NOTICE`](./NOTICE).

This project is not affiliated with, endorsed by, or sponsored by Apple Inc. or Google LLC.
