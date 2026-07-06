import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return <Placeholder />;
}

// Temporary marker while the real Home page is built — proves fonts, tokens
// and i18n are wired. Replace with the R3F hero.
function Placeholder() {
  const t = useTranslations("placeholder");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-display-lg font-bold text-ink-50">
        {t("title")}
      </h1>
      <p className="max-w-md text-lg text-ink-300">{t("subtitle")}</p>
      <span className="mt-6 h-px w-24 bg-gradient-cm" aria-hidden />
    </main>
  );
}
