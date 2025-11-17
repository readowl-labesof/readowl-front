import sanitizeHtml from 'sanitize-html';

// Configure allowed tags/attributes for synopsis HTML
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's', 'u', 'a', 'img',
  'ul', 'ol', 'li',
  'blockquote', 'hr', 'code', 'h2', 'h3'
];
// Extended allowed attributes with style (only enabled when our hook is active)
const ALLOWED_IMAGE_HOSTS = [
  'illusia.com.br',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'i.imgur.com',
  'imgur.com',
  'images.unsplash.com',
  'pbs.twimg.com',
  'ibb.co',
  'i.ibb.co',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'imageshack.com',
  'i.imageshack.com',
  'postimg.cc',
  'i.postimg.cc',
  'flickr.com',
  'live.staticflickr.com',
  'tinypic.com',
  'i.pinimg.com',
  'static.wikia.nocookie.net',
];

function isAllowedImageUrl(src: string): boolean {
  try {
    const u = new URL(src);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    return ALLOWED_IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

// We sanitize using sanitize-html (works in Node and browsers) and avoid jsdom entirely.
function sanitizeWithPolicy(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class', 'data-align'],
    },
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowedStyles: {
      p: { 'text-align': [/^(left|center|right|justify)$/] },
      h2: { 'text-align': [/^(left|center|right|justify)$/] },
      h3: { 'text-align': [/^(left|center|right|justify)$/] },
    },
    disallowedTagsMode: 'discard',
    nonTextTags: ['style', 'script', 'textarea', 'option'],
  });
}

export function sanitizeSynopsisHtml(html: string): string {
  let cleaned = '';
  // Preprocess: migrate text-align from style into a safe data-align attribute on p/h2/h3
  // This ensures alignment survives even if 'style' is removed by DOMPurify (in environments without hooks)
  const preprocessedAlign = (html || '').replace(
    /<(p|h2|h3)([^>]*)style=("|')([^"']*?)\3([^>]*)>/gi,
    (_m, tag: string, before: string, _q: string, styleVal: string, after: string) => {
      const m = /(^|;|\s)text-align\s*:\s*(left|center|right|justify)\s*;?/i.exec(styleVal || '');
      if (!m) return _m; // keep original match
      const align = (m[2] || '').toLowerCase();
      // Attach/replace data-align, keep original style as-is; DOMPurify will strip style if not allowed
      const hasDataAlign = /\sdata-align=\s*("|')(?:left|center|right|justify)\1/i.test(before + after);
      const withData = hasDataAlign
        ? `<${tag}${before.replace(/\sdata-align=\s*("|')(?:left|center|right|justify)\1/i, ` data-align="${align}"`)} style="${styleVal}"${after}>`
        : `<${tag}${before} data-align="${align}" style="${styleVal}"${after}>`;
      return withData;
    }
  );
  // Normalize spacing: remove empty paragraphs like <p><br></p> or <p>&nbsp;</p> and collapse stray NBSPs
  const preprocessed = normalizeHtmlSpacing(preprocessedAlign);
  try {
    cleaned = sanitizeWithPolicy(preprocessed);
  } catch {
    cleaned = (html || '').replace(/<[^>]*>/g, ' ');
  }
  // Strip <img> with disallowed hosts
  return cleaned.replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi, (match: string, src: string) =>
    isAllowedImageUrl(src) ? match : ''
  );
}

export function getPlainTextLength(html: string): number {
  if (typeof window === 'undefined') {
    // Node: quick fallback
    const stripped = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    return stripped.length;
  }
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const text = (div.textContent || div.innerText || '').trim();
  return text.length;
}

// Collapse excessive spacing introduced by WYSIWYG pastes (Docs/Word, etc.)
// - Remove paragraphs that are effectively empty: only <br>, &nbsp; or whitespace
// - Convert NBSP to regular spaces to avoid artificial spacing
// Keeping it conservative to not alter meaningful content.
export function normalizeHtmlSpacing(html: string): string {
  if (!html) return '';
  let out = html;
  // Convert &nbsp; to regular spaces
  out = out.replace(/&nbsp;/gi, ' ');
  // Remove paragraphs that are empty (only <br/> and whitespace)
  out = out.replace(/<p\b[^>]*>(?:\s|<br\s*\/?>)*<\/p>/gi, '');
  // Also remove paragraphs that only contain spaces
  out = out.replace(/<p\b[^>]*>\s*<\/p>/gi, '');
  // Within paragraphs: remove leading/trailing <br> and surrounding whitespace
  out = out.replace(/(<p\b[^>]*>)\s*(?:<br\s*\/?>\s*)+/gi, '$1');
  out = out.replace(/(?:\s*<br\s*\/?>\s*)+(<\/p>)/gi, '$1');
  // Compress multiple consecutive <br> into a single <br>
  out = out.replace(/(?:\s*<br\s*\/?>\s*){2,}/gi, '<br>');
  // Trim spaces inside paragraph boundaries to avoid artificial indents/gaps
  out = out.replace(/(<p\b[^>]*>)\s+/gi, '$1');
  out = out.replace(/\s+(<\/p>)/gi, '$1');
  // Remove multiple consecutive empty <p> just in case (after previous rules)
  out = out.replace(/(?:\s*<p\b[^>]*>\s*<\/p>\s*){2,}/gi, '');
  return out;
}

// Strip all HTML tags and decode a few common entities to plain text
export function stripHtmlToText(html: string): string {
  if (!html) return '';
  // Remove tags
  let text = html.replace(/<[^>]*>/g, ' ');
  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();
  // Basic entity decoding for common cases
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  text = text.replace(/(&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;)/g, (m) => entities[m] || m);
  return text;
}
