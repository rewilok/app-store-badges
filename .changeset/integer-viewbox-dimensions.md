---
"@rewilok/app-store-badges": patch
"@rewilok/app-store-badges-react": patch
"@rewilok/app-store-badges-vue": patch
"@rewilok/app-store-badges-angular": patch
---

Round badge SVG viewBox width and height up to integers so every badge has a clean integer aspect ratio. Fractional viewBox dimensions caused sub-pixel rounding artifacts (e.g. 1px slivers being clipped) when a badge was rendered inside a CSS container with `overflow: hidden`. Drawn content keeps its original coordinates — the canvas is simply enlarged with a small amount of empty space on the right and/or bottom.
