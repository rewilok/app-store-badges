// Removes width/height attributes from the ROOT <svg> element so the asset has
// no intrinsic size. Sizing is then driven entirely by the wrapper's CSS plus
// the injected style="height:100%;width:auto" — making Apple and Google
// badges behave identically across all CSS overrides.
//
// Only the root <svg> tag is touched; width/height on inner elements
// (<rect>, <use>, etc.) are preserved.

const SVG_OPEN_RE = /<svg\b([^>]*)>/;
const ROOT_WIDTH_RE = /\swidth\s*=\s*"[^"]*"/i;
const ROOT_HEIGHT_RE = /\sheight\s*=\s*"[^"]*"/i;

export function stripRootSvgSize(input) {
  const str = typeof input === 'string' ? input : input.toString('utf8');
  const m = str.match(SVG_OPEN_RE);
  const attrs = m?.[1];
  if (attrs === undefined) return str;
  if (!ROOT_WIDTH_RE.test(attrs) && !ROOT_HEIGHT_RE.test(attrs)) return str;
  const cleaned = attrs.replace(ROOT_WIDTH_RE, '').replace(ROOT_HEIGHT_RE, '');
  return str.replace(SVG_OPEN_RE, `<svg${cleaned}>`);
}
