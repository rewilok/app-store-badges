// Rounds the root <svg> viewBox width/height up to the nearest integer so
// every badge has an integer aspect ratio. Fractional viewBox dimensions
// (e.g. 119.66407 × 40) cause sub-pixel rounding artifacts when a badge is
// rendered inside a CSS container with `overflow: hidden`.
//
// min-x and min-y are preserved unchanged; only width and height are ceiled.
// The drawn content keeps its original coordinates, so the artwork is not
// skewed — the canvas is simply enlarged, leaving a small amount of empty
// space on the right and/or bottom.

const SVG_OPEN_RE = /<svg\b([^>]*)>/;
const VIEWBOX_RE = /\sviewBox\s*=\s*"([^"]*)"/i;

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

  const [minX, minY, w, h] = nums;
  const wCeil = Math.ceil(w);
  const hCeil = Math.ceil(h);
  if (wCeil === w && hCeil === h) return str;

  const newViewBox = `${minX} ${minY} ${wCeil} ${hCeil}`;
  const newAttrs = attrs.replace(VIEWBOX_RE, ` viewBox="${newViewBox}"`);
  return str.replace(SVG_OPEN_RE, `<svg${newAttrs}>`);
}
