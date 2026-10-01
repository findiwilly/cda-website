import { jsonLdScript } from "@/lib/seo";

/**
 * Renders a schema.org JSON-LD block.
 *
 * `<` is escaped inside the payload (see `jsonLdScript`) so a value containing
 * `</script>` cannot break out of the tag and inject markup.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
