// Snaps the root <svg> viewBox to integer bounds so every badge has a
// pixel-aligned canvas. Fractional viewBox dimensions (e.g. 119.66407 × 40)
// cause sub-pixel rounding artifacts when a badge is rendered inside a CSS
// container with `overflow: hidden`.
//
// Earlier this helper just `Math.ceil`-ed the vendor viewBox. That preserved
// the artwork's coordinates but did not account for vendor SVGs whose drawn
// content extends slightly past their declared viewBox — Google Play badges
// ship with `viewBox="0 0 238.96 70.87"` while their background <rect> spans
// x = -0.11 → 239.06 and the border <path> reaches x = 239.07. Ceiling to
// `0 0 239 71` left a thin sliver of the rounded corner outside the canvas
// and produced a visible right-edge cut once the integer viewBox aligned the
// content with the device pixel grid.
//
// We now compute the union of (vendor viewBox, every <rect>, every <path d>)
// and snap that to integer bounds — `floor` for min-x/min-y, `ceil` for the
// far edges. Drawn coordinates are not modified, so artwork is never skewed;
// the canvas is simply enlarged outward to fully contain the geometry.
//
// A small epsilon (`SNAP_EPSILON`) is applied before flooring/ceiling so that
// floating-point noise from Adobe Illustrator's bezier control points (e.g.
// y = -1.3e-4 in Apple's lockup paths) doesn't dilate the canvas by a whole
// unit. Real overflow — Google's 0.06–0.11 unit excursion — sits well above
// the threshold and still expands the viewBox.
//
// Limitations: only simple `transform="translate(tx[, ty])"` is honored on
// <rect>/<path> (Apple's NL/AR lockups place every path inside one). Other
// transforms — and any `transform` on an ancestor <g> — cause the element to
// be skipped, leaving only the vendor viewBox to drive that element's bbox.
// Arc bulge is approximated by its endpoints only. None of the current
// vendor assets break these assumptions (arcs are only used via cubic
// beziers whose control points are recorded explicitly, and group-level
// transforms are not present).

const SVG_OPEN_RE = /<svg\b([^>]*)>/;
const VIEWBOX_RE = /\sviewBox\s*=\s*"([^"]*)"/i;
const DEFS_RE = /<defs\b[\s\S]*?<\/defs>/gi;
const RECT_RE = /<rect\b([^>]*?)\/?>/gi;
const PATH_RE = /<path\b([^>]*?)\/?>/gi;
const ATTR_X_RE = /\sx\s*=\s*"([^"]*)"/i;
const ATTR_Y_RE = /\sy\s*=\s*"([^"]*)"/i;
const ATTR_W_RE = /\swidth\s*=\s*"([^"]*)"/i;
const ATTR_H_RE = /\sheight\s*=\s*"([^"]*)"/i;
const ATTR_D_RE = /\sd\s*=\s*"([^"]*)"/i;
const ATTR_TRANSFORM_RE = /\stransform\s*=\s*"([^"]*)"/i;
const SIMPLE_TRANSLATE_RE = /^\s*translate\s*\(\s*(-?[\d.eE+-]+)(?:\s*[,\s]\s*(-?[\d.eE+-]+))?\s*\)\s*$/;

const PATH_SEG_RE = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
const PATH_NUM_RE = /-?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/g;

// Sub-pixel noise from Illustrator-exported beziers stays well below this;
// real designed overflow (e.g. 0.07–0.11) sits above it, so the canvas only
// grows when content meaningfully escapes the vendor viewBox.
const SNAP_EPSILON = 0.05;

function makeBBox() {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function record(bbox, x, y) {
  if (Number.isFinite(x)) {
    if (x < bbox.minX) bbox.minX = x;
    if (x > bbox.maxX) bbox.maxX = x;
  }
  if (Number.isFinite(y)) {
    if (y < bbox.minY) bbox.minY = y;
    if (y > bbox.maxY) bbox.maxY = y;
  }
}

function readAttrFloat(attrs, re, fallback) {
  const m = attrs.match(re);
  if (!m) return fallback;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : fallback;
}

// Returns [tx, ty] for elements with no transform or with a simple
// `translate(...)`. Returns null when a transform is present but unsupported
// (rotate/scale/matrix/multi-op) — caller should skip the element.
function readTranslate(attrs) {
  const m = attrs.match(ATTR_TRANSFORM_RE);
  if (!m) return [0, 0];
  const t = m[1].match(SIMPLE_TRANSLATE_RE);
  if (!t) return null;
  const tx = parseFloat(t[1]);
  const ty = t[2] !== undefined ? parseFloat(t[2]) : 0;
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) return null;
  return [tx, ty];
}

function updateBBoxFromRect(attrs, bbox) {
  const t = readTranslate(attrs);
  if (t === null) return;
  const [tx, ty] = t;
  const x = readAttrFloat(attrs, ATTR_X_RE, 0);
  const y = readAttrFloat(attrs, ATTR_Y_RE, 0);
  const w = readAttrFloat(attrs, ATTR_W_RE, NaN);
  const h = readAttrFloat(attrs, ATTR_H_RE, NaN);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return;
  record(bbox, x + tx, y + ty);
  record(bbox, x + w + tx, y + h + ty);
}

function updateBBoxFromPath(d, tx, ty, bbox) {
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let started = false;
  const rec = (x, y) => record(bbox, x + tx, y + ty);

  for (const seg of d.matchAll(PATH_SEG_RE)) {
    const cmd = seg[1];
    const args = [...seg[2].matchAll(PATH_NUM_RE)].map((m) => parseFloat(m[0]));

    if (cmd === 'M' || cmd === 'm') {
      if (args.length < 2) continue;
      const moveRel = cmd === 'm' && started;
      let x = args[0];
      let y = args[1];
      if (moveRel) { x += cx; y += cy; }
      cx = x; cy = y; sx = x; sy = y;
      rec(x, y);
      started = true;
      const lineRel = cmd === 'm';
      let i = 2;
      while (i + 1 < args.length) {
        let nx = args[i];
        let ny = args[i + 1];
        if (lineRel) { nx += cx; ny += cy; }
        cx = nx; cy = ny;
        rec(nx, ny);
        i += 2;
      }
    } else if (cmd === 'L' || cmd === 'l') {
      const rel = cmd === 'l';
      let i = 0;
      while (i + 1 < args.length) {
        let nx = args[i];
        let ny = args[i + 1];
        if (rel) { nx += cx; ny += cy; }
        cx = nx; cy = ny;
        rec(nx, ny);
        i += 2;
      }
    } else if (cmd === 'H' || cmd === 'h') {
      const rel = cmd === 'h';
      for (let i = 0; i < args.length; i++) {
        let nx = args[i];
        if (rel) nx += cx;
        cx = nx;
        rec(nx, cy);
      }
    } else if (cmd === 'V' || cmd === 'v') {
      const rel = cmd === 'v';
      for (let i = 0; i < args.length; i++) {
        let ny = args[i];
        if (rel) ny += cy;
        cy = ny;
        rec(cx, ny);
      }
    } else if (cmd === 'C' || cmd === 'c') {
      const rel = cmd === 'c';
      let i = 0;
      while (i + 5 < args.length) {
        let x1 = args[i];
        let y1 = args[i + 1];
        let x2 = args[i + 2];
        let y2 = args[i + 3];
        let x = args[i + 4];
        let y = args[i + 5];
        if (rel) {
          x1 += cx; y1 += cy;
          x2 += cx; y2 += cy;
          x += cx; y += cy;
        }
        rec(x1, y1);
        rec(x2, y2);
        rec(x, y);
        cx = x; cy = y;
        i += 6;
      }
    } else if (cmd === 'S' || cmd === 's') {
      const rel = cmd === 's';
      let i = 0;
      while (i + 3 < args.length) {
        let x2 = args[i];
        let y2 = args[i + 1];
        let x = args[i + 2];
        let y = args[i + 3];
        if (rel) {
          x2 += cx; y2 += cy;
          x += cx; y += cy;
        }
        rec(x2, y2);
        rec(x, y);
        cx = x; cy = y;
        i += 4;
      }
    } else if (cmd === 'Q' || cmd === 'q') {
      const rel = cmd === 'q';
      let i = 0;
      while (i + 3 < args.length) {
        let x1 = args[i];
        let y1 = args[i + 1];
        let x = args[i + 2];
        let y = args[i + 3];
        if (rel) {
          x1 += cx; y1 += cy;
          x += cx; y += cy;
        }
        rec(x1, y1);
        rec(x, y);
        cx = x; cy = y;
        i += 4;
      }
    } else if (cmd === 'T' || cmd === 't') {
      const rel = cmd === 't';
      let i = 0;
      while (i + 1 < args.length) {
        let x = args[i];
        let y = args[i + 1];
        if (rel) { x += cx; y += cy; }
        rec(x, y);
        cx = x; cy = y;
        i += 2;
      }
    } else if (cmd === 'A' || cmd === 'a') {
      // Approximate the arc by its endpoint. The vendor badges don't use arcs
      // for outer geometry, so this approximation is safe in practice.
      const rel = cmd === 'a';
      let i = 0;
      while (i + 6 < args.length) {
        let x = args[i + 5];
        let y = args[i + 6];
        if (rel) { x += cx; y += cy; }
        rec(x, y);
        cx = x; cy = y;
        i += 7;
      }
    } else if (cmd === 'Z' || cmd === 'z') {
      cx = sx; cy = sy;
    }
  }
}

export function roundSvgViewBox(input) {
  const str = typeof input === 'string' ? input : input.toString('utf8');
  const tagMatch = str.match(SVG_OPEN_RE);
  const attrs = tagMatch?.[1];
  if (attrs === undefined) return str;

  const vbMatch = attrs.match(VIEWBOX_RE);
  if (!vbMatch) return str;

  const tokens = vbMatch[1].trim().split(/[\s,]+/);
  if (tokens.length !== 4) return str;
  const nums = tokens.map(Number);
  if (!nums.every(Number.isFinite)) return str;
  const [vbMinX, vbMinY, vbW, vbH] = nums;

  const bbox = makeBBox();
  record(bbox, vbMinX, vbMinY);
  record(bbox, vbMinX + vbW, vbMinY + vbH);

  const drawn = str.replace(DEFS_RE, '');
  for (const m of drawn.matchAll(RECT_RE)) updateBBoxFromRect(m[1], bbox);
  for (const m of drawn.matchAll(PATH_RE)) {
    const elAttrs = m[1];
    const dMatch = elAttrs.match(ATTR_D_RE);
    if (!dMatch) continue;
    const t = readTranslate(elAttrs);
    if (t === null) continue;
    updateBBoxFromPath(dMatch[1], t[0], t[1], bbox);
  }

  const newMinX = Math.floor(bbox.minX + SNAP_EPSILON);
  const newMinY = Math.floor(bbox.minY + SNAP_EPSILON);
  const newW = Math.ceil(bbox.maxX - SNAP_EPSILON) - newMinX;
  const newH = Math.ceil(bbox.maxY - SNAP_EPSILON) - newMinY;

  if (newMinX === vbMinX && newMinY === vbMinY && newW === vbW && newH === vbH) {
    return str;
  }

  const newViewBox = `${newMinX} ${newMinY} ${newW} ${newH}`;
  const newAttrs = attrs.replace(VIEWBOX_RE, ` viewBox="${newViewBox}"`);
  return str.replace(SVG_OPEN_RE, `<svg${newAttrs}>`);
}
