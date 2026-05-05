# @rewilok/app-store-badges

Framework-agnostic web components for the official **App Store** and **Google Play** badges, with locale-aware asset selection.

This is the core package. It ships:

- Web Components — `<app-store-badge>` and `<google-play-badge>` (via `/elements`)
- A programmatic registry for resolving and fetching badge SVGs (via `/registry`)

For the React, Vue, or Angular wrappers, see the framework packages in this monorepo.

## Install

```sh
pnpm add @rewilok/app-store-badges
```

## Usage

### Web Components

```html
<script type="module">
  import '@rewilok/app-store-badges/elements';
</script>

<app-store-badge locale="fr-CA" theme="white"></app-store-badge>
<google-play-badge></google-play-badge>
```

The custom elements register themselves on import. To register them manually with a specific tag name or registry, use `defineCustomElements` from `@rewilok/app-store-badges`.

### Programmatic registry

```ts
import { getBadge, resolveLocale, listLocales } from '@rewilok/app-store-badges/registry';

const { svg, locale } = await getBadge('app-store', { locale: 'de', theme: 'black' });
```

## Locale resolution

If `locale` is omitted, the component consults `navigator.languages`. If no match is found, it falls back to `fallback` (default `"en"`). Region tags such as `pt-BR`, `sl-SI`, or `he-IL` are preserved as distinct variants — they are not collapsed to language-only keys.

## Legal attribution

The badge artwork is the property of Apple Inc. and Google LLC and is governed by their brand guidelines. **Read and follow the brand guidelines and trademark notices in the [root README](../../README.md#legal-attribution-required) and [`NOTICE`](../../NOTICE) before shipping.** This library does not exempt you from those terms.

## License

Code is licensed under the [Apache License 2.0](./LICENSE). Badge artwork is **not** covered by that license. See [`NOTICE`](./NOTICE) for trademark attributions.
