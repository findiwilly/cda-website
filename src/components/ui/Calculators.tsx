"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { animate } from "motion/react";
import { MessageCircle } from "lucide-react";
import { dur, ease } from "@/lib/motion-tokens";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

type CalcDef = {
  key: "roi" | "ltv" | "cac" | "churn";
  fields: { key: string; default: number }[];
  compute: (v: number[]) => number;
  kind: "percent" | "money";
};

const CALCS: CalcDef[] = [
  {
    key: "roi",
    fields: [
      { key: "invested", default: 500_000 },
      { key: "gained", default: 800_000 },
    ],
    compute: ([invested, gained]) =>
      invested > 0 ? ((gained - invested) / invested) * 100 : 0,
    kind: "percent",
  },
  {
    key: "ltv",
    fields: [
      { key: "aov", default: 15_000 },
      { key: "freq", default: 6 },
      { key: "years", default: 3 },
    ],
    compute: ([aov, freq, years]) => aov * freq * years,
    kind: "money",
  },
  {
    key: "cac",
    fields: [
      { key: "spend", default: 300_000 },
      { key: "customers", default: 40 },
    ],
    compute: ([spend, customers]) => (customers > 0 ? spend / customers : 0),
    kind: "money",
  },
  {
    key: "churn",
    fields: [
      { key: "start", default: 200 },
      { key: "lost", default: 14 },
    ],
    compute: ([start, lost]) => (start > 0 ? (lost / start) * 100 : 0),
    kind: "percent",
  },
];

function AnimatedResult({ value, kind }: { value: number; kind: CalcDef["kind"] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const locale = useLocale();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) =>
      kind === "percent"
        ? `${v.toFixed(1).replace(/\.0$/, "")} %`
        : `${new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            maximumFractionDigits: 0,
          }).format(v)} FCFA`;
    const controls = animate(prev.current, value, {
      duration: dur.fast,
      ease: ease.out,
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, kind, locale]);

  return <span ref={ref} />;
}

function CalcCard({ def }: { def: CalcDef }) {
  const t = useTranslations("resources");
  const [values, setValues] = useState(def.fields.map((f) => f.default));
  const result = def.compute(values);

  return (
    <div className="glass flex h-full flex-col rounded-3xl p-8">
      <h3 className="font-display text-xl font-semibold text-ink-50">
        {t(`${def.key}.name`)}
      </h3>
      <p className="mt-1.5 text-sm text-ink-300">{t(`${def.key}.desc`)}</p>

      <div className="mt-6 flex flex-col gap-4">
        {def.fields.map((field, i) => (
          <label key={field.key} className="block">
            <span className="text-xs uppercase tracking-[0.15em] text-ink-400">
              {t(`${def.key}.${field.key}`)}
            </span>
            <input
              type="number"
              min={0}
              value={Number.isNaN(values[i]) ? "" : values[i]}
              onChange={(e) =>
                setValues((v) =>
                  v.map((x, j) => (j === i ? e.target.valueAsNumber : x))
                )
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 outline-none transition-colors duration-300 focus:border-cdagreen/60"
            />
          </label>
        ))}
      </div>

      <div className="mt-8 border-t border-white/5 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">
          {t(`${def.key}.result`)}
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-cdagreen-bright">
          <AnimatedResult
            value={Number.isFinite(result) ? result : 0}
            kind={def.kind}
          />
        </p>
      </div>

      <a
        href={waLink(SITE.whatsappNumber, t("improve"))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm text-ink-200 transition-colors hover:text-white"
      >
        <MessageCircle className="h-4 w-4 text-cdagreen-bright" />
        {t("improve")}
      </a>
    </div>
  );
}

export function Calculators() {
  return (
    <Stagger className="grid gap-4 md:grid-cols-2">
      {CALCS.map((def) => (
        <StaggerItem key={def.key} className="h-full">
          <CalcCard def={def} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
