import "server-only";

import { Marked, Renderer } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Blog post rendering.
 *
 * Admin-authored content is markdown, but it is still untrusted input: a
 * compromised or careless admin session could otherwise store `<script>` or an
 * `onerror` handler and have it served to every visitor. So the pipeline is
 * always **parse → sanitize**, and the sanitizer's allowlist is explicit rather
 * than a denylist.
 *
 * Allowed: headings, prose, lists, links, images, code, quotes, tables.
 * Not allowed: script, style, iframe, form, event handlers, `javascript:` URLs.
 */

const marked = new Marked({
  gfm: true,
  breaks: false,
  // No raw HTML passthrough. Anything resembling a tag is escaped and shown as
  // text, so an author who needs markup must use markdown syntax.
  async: false,
});

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * The `##`/`###` outline of a document, with a stable id per heading.
 *
 * This is the single source of truth for heading ids. `marked` stopped emitting
 * them in v8, so `renderMarkdown` re-attaches exactly these ids to the HTML —
 * that is what makes the in-page table of contents links actually resolve
 * instead of pointing at nothing.
 *
 * Repeated headings are unavoidable in practice (`## Résumé` twice in one post),
 * so a seen counter suffixes repeats the way GitHub does.
 */
export function outlineOf(markdown: string): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const text = match[2].replace(/[*_`]/g, "").trim();
    if (!text) continue;

    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    headings.push({
      id: count === 0 ? base : `${base}-${count}`,
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}

/**
 * Id for the nth occurrence of `text` in the outline.
 *
 * Headings are numbered independently in both the markdown scan and the render
 * walk, so keying by text and counting occurrences keeps the two in lockstep —
 * the alternative (matching on rendered inner HTML) breaks as soon as a heading
 * contains inline markdown such as `## **Bold** title`.
 */
function idNthTime(outline: Heading[], text: string, index: number): string | undefined {
  let seen = 0;
  for (const heading of outline) {
    if (heading.text !== text) continue;
    if (seen === index) return heading.id;
    seen += 1;
  }
  return undefined;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5",
    "p", "br", "hr",
    "strong", "em", "del", "sup", "sub",
    "ul", "ol", "li",
    "blockquote",
    "code", "pre",
    "a", "img",
    "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading", "decoding"],
    th: ["align"],
    td: ["align"],
    // Stamped by `renderMarkdown` from `outlineOf` so the table of contents can
    // link into the article body.
    h2: ["id"],
    h3: ["id"],
  },
  // Blocks javascript:, data: and vbscript: URIs. Cloudinary's https:// delivery
  // URLs and any other https image are unaffected.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  transformTags: {
    // Outbound links open safely and cannot reach back via window.opener.
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
    }),
    // Blog images are below the fold by definition — never block first paint.
    img: (_tagName, attribs) => ({
      tagName: "img",
      attribs: { ...attribs, loading: "lazy", decoding: "async" },
    }),
  },
};

/**
 * Markdown → safe HTML. Never throws; malformed markdown degrades to text.
 *
 * Headings get the ids from `outlineOf` attached before sanitizing, and `id` is
 * added to the sanitizer's allowlist for h2/h3 so the attribute survives.
 */
export function renderMarkdown(markdown: string): string {
  try {
    const outline = outlineOf(markdown);

    // Counts occurrences per heading text as the renderer walks them, so the
    // nth `## Résumé` gets the nth id from the outline.
    const seen = new Map<string, number>();
    const idsFor = (text: string): string | undefined => {
      const index = seen.get(text) ?? 0;
      seen.set(text, index + 1);
      return idNthTime(outline, text, index);
    };

    const parsed = marked.parse(markdown, {
      renderer: headingIdRenderer(idsFor),
    }) as string;

    return sanitizeHtml(parsed, SANITIZE_OPTIONS);
  } catch (error) {
    console.error("[cda] markdown render failed:", error);
    return "";
  }
}

/**
 * A renderer that stamps `id` onto `##`/`###`; every other method is the stock
 * one, because `marked` requires a complete renderer instance and any method it
 * cannot find throws at render time.
 */
function headingIdRenderer(idsFor: (text: string) => string | undefined): Renderer {
  const renderer = new Renderer();
  const fallback = renderer.heading.bind(renderer);

  renderer.heading = function (token) {
    // Level 1 is the page title, already rendered by the page itself; deeper
    // levels are too granular for a sidebar table of contents.
    if (token.depth < 2 || token.depth > 3) return fallback(token);

    // Match on the raw markdown text, not on rendered HTML: `## **Bold** title`
    // renders as `Bold title` inside a `<strong>`, so only `token.text` lines up
    // with what `outlineOf` scanned.
    const id = idsFor(token.text.replace(/[*_`]/g, "").trim());
    if (!id) return fallback(token);

    const text = this.parser.parseInline(token.tokens);
    return `<h${token.depth} id="${id}">${text}</h${token.depth}>`;
  };

  return renderer;
}

/**
 * Heading outline for a post, used to build an in-page table of contents.
 * A thin alias over `outlineOf` so both consumers cannot drift apart.
 */
export function extractHeadings(markdown: string): Heading[] {
  return outlineOf(markdown);
}

/**
 * GitHub-style slug: lowercase, hyphenated, non-alphanumerics collapsed.
 *
 * The diacritic strip is written with `\u` escapes rather than literal
 * combining characters. U+0300 and U+036F are invisible in an editor and only
 * render next to a base letter, so any tool that reads this file without
 * assuming UTF-8 transcodes them into a plausible-looking character class that
 * matches nothing — a bare `Get-Content` in Windows PowerShell does exactly
 * that. The failure is silent, and French content is accented throughout, so
 * it would surface as `r-sum` instead of `resume` in post slugs and in
 * table-of-contents anchors. Keep the escapes.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Turn a title into a URL slug, with a numeric suffix when `taken` reports the
 * base is already in use.
 */
export function uniqueSlug(title: string, taken: (slug: string) => boolean): string {
  const base = slugify(title) || "post";
  if (!taken(base)) return base;

  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
