// Conservative SVG minifier for the vendor badge assets.
// - Drops the XML processing instruction (not needed for inline SVG).
// - Drops XML/HTML comments (Adobe Illustrator generator stamps etc).
// - Drops <title> nodes (the framework wrappers expose aria-label on the
//   wrapping element, so the inline title is redundant).
// - Collapses whitespace between tags.
//
// Intentionally does not touch attribute values, path data, or CSS inside
// <style> blocks — keeps the transform safe and reversible.

const XML_DECL_RE = /<\?xml[\s\S]*?\?>\s*/g;
const COMMENT_RE = /<!--[\s\S]*?-->/g;
const TITLE_RE = /<title\b[^>]*(?:\/>|>[\s\S]*?<\/title>)\s*/gi;
const INTER_TAG_WS_RE = />\s+</g;

export function minifySvg(input) {
  const str = typeof input === 'string' ? input : input.toString('utf8');
  return str
    .replace(XML_DECL_RE, '')
    .replace(COMMENT_RE, '')
    .replace(TITLE_RE, '')
    .replace(INTER_TAG_WS_RE, '><')
    .trim();
}
