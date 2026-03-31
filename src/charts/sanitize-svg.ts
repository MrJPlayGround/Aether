/**
 * SVG sanitizer for model-generated chart markup.
 *
 * Strategy: allowlist-only. Strip everything except known-safe SVG drawing
 * elements and presentation attributes. No scripts, no event handlers, no
 * external references, no embedded content.
 */

const ALLOWED_ELEMENTS = new Set([
  "svg", "g", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "path", "text", "tspan", "defs", "clippath", "mask",
  "lineargradient", "radialgradient", "stop",
  "marker", "use", "title", "desc",
]);

const ALLOWED_ATTRS = new Set([
  // Structural
  "viewbox", "xmlns", "id", "class",
  // Geometry
  "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
  "width", "height", "d", "points",
  // Presentation
  "fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray",
  "stroke-linecap", "stroke-linejoin", "stroke-opacity",
  "opacity", "transform", "font-family", "font-size", "font-weight",
  "font-style", "text-anchor", "dominant-baseline", "text-decoration",
  "letter-spacing",
  // Gradient/clip
  "offset", "stop-color", "stop-opacity", "gradientunits",
  "gradienttransform", "clip-path",
  // Marker
  "marker-start", "marker-mid", "marker-end", "markerwidth", "markerheight",
  "orient", "refx", "refy", "markerunits",
  // Layout
  "dx", "dy", "preserveaspectratio",
]);

// Patterns that indicate unsafe content
const UNSAFE_PATTERNS = [
  /javascript\s*:/i,
  /data\s*:/i,
  /on\w+\s*=/i,                  // onclick, onload, etc.
  /<script/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<foreignobject/i,
  /url\s*\(\s*["']?\s*http/i,    // external URL references
  /xlink:href\s*=\s*["']http/i,
  /href\s*=\s*["'](?!#)/i,       // href to anything except internal refs
];

export function sanitizeSvg(raw: string): string | null {
  // Extract the SVG element
  const svgMatch = raw.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) return null;

  let svg = svgMatch[0];

  // Quick reject: if any unsafe pattern is found, strip aggressively
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(svg)) {
      // Remove the unsafe content rather than rejecting entirely
      svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
      svg = svg.replace(/<foreignobject[\s\S]*?<\/foreignobject>/gi, "");
      svg = svg.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
      svg = svg.replace(/<object[\s\S]*?<\/object>/gi, "");
      svg = svg.replace(/<embed[\s\S]*?\/>/gi, "");
      // Strip all event handler attributes
      svg = svg.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
      svg = svg.replace(/\s+on\w+\s*=\s*\S+/gi, "");
      // Strip javascript: and data: URIs in attribute values
      svg = svg.replace(/javascript\s*:[^"']*/gi, "");
      svg = svg.replace(/data\s*:[^"']*/gi, "");
    }
  }

  // Element-level filtering: remove unknown elements
  svg = svg.replace(/<\/?([a-z][a-z0-9-]*)/gi, (match, tag) => {
    const lower = tag.toLowerCase();
    if (ALLOWED_ELEMENTS.has(lower)) return match;
    // Replace disallowed elements with <g> (grouping, harmless)
    if (match.startsWith("</")) return "</g";
    return "<g";
  });

  // Attribute-level filtering on each opening tag
  svg = svg.replace(/<([a-z][a-z0-9-]*)(\s[^>]*)?>/gi, (match, tag, attrsStr) => {
    if (!attrsStr) return match;

    // Parse and filter attributes
    const filtered: string[] = [];
    const attrRegex = /\s+([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Skip disallowed attributes
      if (!ALLOWED_ATTRS.has(attrName)) continue;

      // Skip attributes with suspicious values
      if (/javascript\s*:/i.test(attrValue)) continue;
      if (/data\s*:/i.test(attrValue)) continue;

      filtered.push(` ${attrName}="${escapeAttr(attrValue)}"`);
    }

    return `<${tag}${filtered.join("")}>`;
  });

  // Final validation: must still be a well-formed SVG
  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) return null;

  return svg;
}

function escapeAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
