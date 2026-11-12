import { useI18n } from "../i18n";

export function Marquee() {
  const { t } = useI18n();
  const row = t.hero.marquee;
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-b border-line/70 bg-gold py-2.5 text-[#1a1710]"
    >
      <div className="animate-marquee flex w-max whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-[0.22em]">
        {[0, 1].map((i) => (
          <span key={i} className="pr-2">
            {row}
            {row}
          </span>
        ))}
      </div>
    </div>
  );
}
