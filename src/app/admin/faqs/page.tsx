import { requireAdminPage } from "@/lib/admin-guard";
import { listAllFaqs } from "@/lib/content";
import { FaqForm } from "./FaqForm";
import { FaqRow } from "./FaqRow";
import { LOCALES } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

/**
 * FAQ management.
 *
 * Grouped by locale then category, which mirrors how the public `/faq` page
 * reads — so an admin can see the structure a visitor will see.
 */
export default async function AdminFaqsPage() {
  await requireAdminPage();

  const faqs = await listAllFaqs();

  const byLocale = LOCALES.map((locale) => {
    const items = faqs.filter((f) => f.locale === locale);
    const categories = [...new Set(items.map((f) => f.category))].sort();
    return { locale, items, categories };
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-display-sm font-bold text-ink-50">
          Frequently asked questions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          These render on the <code className="text-cdagreen-bright">/faq</code>{" "}
          page and feed the structured data that powers Google rich results, so a
          question and its answer must both read well on their own.
        </p>
      </header>

      <FaqForm />

      {faqs.length === 0 ? (
        <p className="glass rounded-2xl p-10 text-center text-sm text-ink-400">
          No FAQs yet. Add the questions your clients ask on every call.
        </p>
      ) : (
        byLocale.map(({ locale, items, categories }) =>
          items.length === 0 ? null : (
            <section key={locale} className="space-y-5">
              <h2 className="font-display text-lg font-semibold text-ink-50">
                {locale === "fr" ? "Français" : "English"}
                <span className="ml-3 text-sm font-normal text-ink-500">
                  {items.length}
                </span>
              </h2>

              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright">
                    {category}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {items
                      .filter((f) => f.category === category)
                      .map((faq) => (
                        <FaqRow key={faq._id} faq={faq} />
                      ))}
                  </div>
                </div>
              ))}
            </section>
          ),
        )
      )}
    </div>
  );
}