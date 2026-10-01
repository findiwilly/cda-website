/**
 * Renders sanitized markdown as page content.
 *
 * `dangerouslySetInnerHTML` is safe here only because `renderMarkdown` has
 * already run the HTML through an explicit tag/attribute/scheme allowlist. The
 * component itself never touches raw markdown.
 *
 * It is a server component on purpose: the HTML is already final, so there is
 * nothing to hydrate, and shipping the body text to the client as a JS string
 * would only bloat the bundle.
 */
export function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="prose-cda"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}