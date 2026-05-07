---
"@rewilok/app-store-badges": patch
"@rewilok/app-store-badges-react": patch
"@rewilok/app-store-badges-vue": patch
"@rewilok/app-store-badges-angular": patch
---

Expand the viewBox to fully contain drawn content before snapping to integers. Several Google Play vendor SVGs (e.g. English) ship with a background `<rect>` and rounded-corner border path that extends slightly past the declared viewBox. Once the canvas was integer-aligned with the device pixel grid, that overflow showed up as a hard cut on the right edge. The build now unions the vendor viewBox with the bounding box of every `<rect>` and `<path>`, then snaps via floor-min / ceil-max, so artwork is never clipped and never skewed.
