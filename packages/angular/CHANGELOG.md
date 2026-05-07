# @rewilok/app-store-badges-angular

## 0.1.2

### Patch Changes

- 263185a: Round badge SVG viewBox width and height up to integers so every badge has a clean integer aspect ratio. Fractional viewBox dimensions caused sub-pixel rounding artifacts (e.g. 1px slivers being clipped) when a badge was rendered inside a CSS container with `overflow: hidden`. Drawn content keeps its original coordinates — the canvas is simply enlarged with a small amount of empty space on the right and/or bottom.
- Updated dependencies [263185a]
  - @rewilok/app-store-badges@0.1.2

## 0.1.1

### Patch Changes

- d4c35b5: Strip intrinsic width/height from badge SVGs and apply consistent height defaults in framework components so badges scale correctly via CSS instead of locking to their source dimensions.
- Updated dependencies [d4c35b5]
  - @rewilok/app-store-badges@0.1.1
