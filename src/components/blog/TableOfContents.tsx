import type { Heading } from "@/lib/markdown";

/**
 * In-page table of contents for an article.
 *
 * A server component: the outline is derived from the post's markdown at build or
 * revalidation time, and anchor navigation needs no JavaScript. The `scroll-mt`
 * on the prose headings (in globals.css) keeps a target heading clear of the
 * fixed navbar when jumped to.
 *
 * `##` entries sit flush left and `###` entries indent — enough structure to
 * scan without a nested list that screen readers would have to traverse.
 */
export function TableOfContents({
  headings,
  label,
}: {
  headings: Heading[];
  label: string;
}) {
  // Below `lg` the sidebar would push the article down the page, so it is not
  // rendered at all rather than being hidden with CSS — an empty nav landmark
  // is worse than no nav.
  if (headings.length < 2) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="mb-12 lg:mb-0 lg:sticky lg:top-28 lg:self-start"
    >
      <h2
        id="toc-heading"
        className="text-[0.65rem] uppercase tracking-[0.35em] text-ink-500"
      >
        {label}
      </h2>

      <ol className="mt-5 space-y-2.5 border-l border-white/10 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${heading.id}`}
              className="block border-l border-transparent pl-4 leading-snug text-ink-400 transition-colors duration-300 hover:border-cdagreen-bright hover:text-ink-100"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}