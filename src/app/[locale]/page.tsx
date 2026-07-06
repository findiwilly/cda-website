import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { HeroScene } from "@/components/three/HeroScene";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceGlyph } from "@/components/ui/ServiceGlyph";
import { FEATURED_SERVICES, HOME_STATS } from "@/lib/constants";

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <Stats />
      <ServicesPreview />
      <FinalCta />
      <WhatsAppButton />
    </main>
  );
}

function Hero() {
  const t = useTranslations("home.hero");
  const cta = useTranslations("cta");

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      {/* Flag-color glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 bottom-[-10rem] h-[34rem] w-[34rem] rounded-full bg-cdagreen/25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-[-6rem] h-[30rem] w-[30rem] rounded-full bg-cdayellow/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] bottom-[8%] h-56 w-56 rounded-full bg-cdared/10 blur-[100px]"
      />

      <HeroScene className="absolute inset-0" />

      {/* Vignette so the headline stays readable over the particle field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_center,rgba(10,10,11,0.72),transparent_75%)]"
      />

      <Stagger
        gap={0.12}
        delay={0.2}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <StaggerItem>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
            {t("eyebrow")}
          </p>
        </StaggerItem>
        <StaggerItem>
          <h1 className="mt-6 font-display text-display-xl font-bold text-ink-50">
            {t.rich("title", {
              accent: (chunks) => (
                <span className="text-gradient-cm">{chunks}</span>
              ),
            })}
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-6 max-w-xl text-base text-ink-300 sm:text-lg">
            {t("subtitle")}
          </p>
        </StaggerItem>
        <StaggerItem className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <ButtonLink href="/contact">{cta("bookFreeSession")}</ButtonLink>
          <ButtonLink href="/industries" variant="ghost">
            {cta("exploreIndustries")}
          </ButtonLink>
        </StaggerItem>
      </Stagger>
    </section>
  );
}

function Stats() {
  const t = useTranslations("home.stats");

  return (
    <section className="relative border-y border-white/5 bg-ink-900/50">
      <Stagger className="mx-auto grid max-w-content grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-3 sm:py-20">
        {HOME_STATS.map((stat) => (
          <StaggerItem key={stat.key} className="text-center">
            <Counter
              value={stat.value}
              suffix={stat.suffix}
              className="font-display text-display-md font-bold text-ink-50"
            />
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-ink-300">
              {t(stat.key)}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function ServicesPreview() {
  const t = useTranslations("home.services");
  const s = useTranslations("services");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Reveal className="max-w-2xl">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 font-display text-display-md font-bold text-ink-50">
          {t("title")}
        </h2>
        <p className="mt-4 text-ink-300">{t("subtitle")}</p>
      </Reveal>

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_SERVICES.map((slug) => (
          <StaggerItem key={slug} className="h-full">
            <Link
              href="/services"
              className="glass group relative block h-full rounded-2xl p-7 transition-colors duration-300 ease-out-expo hover:border-cdagreen/40"
            >
              <ServiceGlyph
                slug={slug}
                className="h-8 w-8 text-cdagreen-bright transition-transform duration-300 ease-out-expo group-hover:scale-110"
              />
              <h3 className="mt-6 font-display text-lg font-semibold text-ink-50">
                {s(`${slug}.name`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                {s(`${slug}.pitch`)}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 text-center">
        <ButtonLink href="/services" variant="ghost">
          {t("viewAll")}
        </ButtonLink>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("home.finalCta");
  const cta = useTranslations("cta");

  return (
    <section className="relative overflow-hidden border-t border-white/5">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cdagreen/15 blur-[120px]"
      />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-section text-center">
        <h2 className="font-display text-display-md font-bold text-ink-50">
          {t("title")}
        </h2>
        <p className="mt-5 max-w-xl text-ink-300">{t("subtitle")}</p>
        <ButtonLink href="/contact" className="mt-10">
          {cta("bookFreeSession")}
        </ButtonLink>
      </Reveal>
    </section>
  );
}
