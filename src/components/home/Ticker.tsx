import { useTranslations } from "next-intl";

/** "CDA in action" live-activity marquee — social proof in motion */
export function Ticker() {
  const t = useTranslations("home.ticker");
  const items = [1, 2, 3, 4, 5, 6].map((i) => t(`item${i}` as "item1"));

  const Row = ({ hidden }: { hidden?: boolean }) => (
    <div
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-12 pr-12"
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-3 whitespace-nowrap text-sm text-ink-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cdagreen-bright opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cdagreen-bright" />
          </span>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-ink-900/40 py-3.5">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent"
      />
    </div>
  );
}
