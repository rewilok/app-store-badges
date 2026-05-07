# @rewilok/app-store-badges

## 0.1.3

### Patch Changes

- 53f928b: Expand the viewBox to fully contain drawn content before snapping to integers. Several Google Play vendor SVGs (e.g. English) ship with a background `<rect>` and rounded-corner border path that extends slightly past the declared viewBox. Once the canvas was integer-aligned with the device pixel grid, that overflow showed up as a hard cut on the right edge. The build now unions the vendor viewBox with the bounding box of every `<rect>` and `<path>`, then snaps via floor-min / ceil-max, so artwork is never clipped and never skewed.

## 0.1.2

### Patch Changes

- 263185a: Round badge SVG viewBox width and height up to integers so every badge has a clean integer aspect ratio. Fractional viewBox dimensions caused sub-pixel rounding artifacts (e.g. 1px slivers being clipped) when a badge was rendered inside a CSS container with `overflow: hidden`. Drawn content keeps its original coordinates — the canvas is simply enlarged with a small amount of empty space on the right and/or bottom.

## 0.1.1

### Patch Changes

- d4c35b5: Strip intrinsic width/height from badge SVGs and apply consistent height defaults in framework components so badges scale correctly via CSS instead of locking to their source dimensions.
