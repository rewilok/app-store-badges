# @rewilok/app-store-badges-angular

Angular 16+ standalone components for [`@rewilok/app-store-badges`](../core).

## Install

```sh
pnpm add @rewilok/app-store-badges-angular
```

`@rewilok/app-store-badges` is included as a dependency — you do not need to install the core package separately.

## Usage

The components are standalone — import them directly into the consuming component or NgModule:

```ts
import { Component } from '@angular/core';
import {
  AppStoreBadgeComponent,
  GooglePlayBadgeComponent,
} from '@rewilok/app-store-badges-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [AppStoreBadgeComponent, GooglePlayBadgeComponent],
  template: `
    <app-store-badge
      locale="de"
      theme="black"
      href="https://apps.apple.com/…"
    ></app-store-badge>
    <google-play-badge
      fallback="en"
      href="https://play.google.com/store/apps/details?id=…"
    ></google-play-badge>
  `,
})
export class FooterComponent {}
```

### Inputs

Both components accept:

- `locale?: string` — BCP-47 tag. If omitted, `navigator.languages` is consulted.
- `fallback?: string` — locale used when no match is found. Default `'en'`.
- `href?: string` — when set, the badge renders inside an `<a>` (defaults: `target="_blank"`, `rel="noopener noreferrer"`).
- `ariaLabel?: string` — defaults to the product's official English label.

`AppStoreBadgeComponent` additionally accepts `theme: 'black' | 'white'` (default `'black'`). Google Play does not publish a white badge variant.

## Legal attribution

The badge artwork is the property of Apple Inc. and Google LLC and is governed by their brand guidelines. **Read and follow the brand guidelines and trademark notices in the [root README](../../README.md#legal-attribution-required) and [`NOTICE`](../../NOTICE) before shipping.** This library does not exempt you from those terms.

## License

Code is licensed under the [Apache License 2.0](./LICENSE). Badge artwork is **not** covered by that license. See [`NOTICE`](./NOTICE) for trademark attributions.
