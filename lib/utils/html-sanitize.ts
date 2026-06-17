import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize article HTML before persisting or rendering. Allows only the tags
 * the in-app TipTap editor can produce (StarterKit + Link). Any other tag or
 * attribute (script, on*, style, iframe, etc.) is stripped.
 */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "dir", "lang"],
    // Force every anchor to open safely in a new tab.
    ADD_ATTR: ["target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip every tag and condense whitespace — used for list-card previews
 * where we want a plain-text excerpt of an HTML article.
 */
export function stripHtmlToText(html: string): string {
  if (!html) return "";
  // First pass DOMPurify with no allowed tags = plain text.
  const stripped = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped.replace(/\s+/g, " ").trim();
}
