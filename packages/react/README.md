# @rewilok/app-store-badges-react

React 17+ bindings for [`@rewilok/app-store-badges`](../core).

## Install

```sh
pnpm add @rewilok/app-store-badges-react
```

`@rewilok/app-store-badges` is included as a dependency — you do not need to install the core package separately.

## Usage

```tsx
import { AppStoreBadge, GooglePlayBadge } from '@rewilok/app-store-badges-react';

export function Footer() {
  return (
    <>
      <AppStoreBadge
        locale="de"
        theme="black"
        href="https://apps.apple.com/…"
      />
      <GooglePlayBadge
        fallback="en"
        href="https://play.google.com/store/apps/details?id=…"
      />
    </>
  );
}
```

### Props

Both components accept:

- `locale?: string` — BCP-47 tag. If omitted, `navigator.languages` is consulted.
- `fallback?: string` — locale used when no match is found. Default `'en'`.
- `href?: string` — when set, the badge renders inside an `<a>` (defaults: `target="_blank"`, `rel="noopener noreferrer"`).
- `aria-label?: string` — defaults to the product's official English label.
- `placeholder?: ReactNode` — rendered while the SVG is loading.
- standard `HTMLAttributes` (`style`, `className`, etc.).

`AppStoreBadge` additionally accepts `theme?: 'black' | 'white'` (default `'black'`). Google Play does not publish a white badge variant.

## Legal attribution

The badge artwork is the property of Apple Inc. and Google LLC and is governed by their brand guidelines. **Read and follow the brand guidelines and trademark notices in the [root README](../../README.md#legal-attribution-required) and [`NOTICE`](../../NOTICE) before shipping.** This library does not exempt you from those terms.

## License

Code is licensed under the [Apache License 2.0](./LICENSE). Badge artwork is **not** covered by that license. See [`NOTICE`](./NOTICE) for trademark attributions.
