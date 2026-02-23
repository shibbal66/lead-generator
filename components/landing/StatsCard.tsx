import React, { useEffect, useRef, useState } from "react";

export type StatsItem = { value: string; label: string; description?: string };

export function parseStatValue(value: string): { numeric: number; suffix: string } | null {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) return { numeric: parseInt(match[1], 10), suffix: match[2] || "" };
  return null;
}

const DURATION_MS = 1800;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const CARD_ACCENTS = [
  { dotVar: "--landing-stats-accent1-dot", textVar: "--landing-stats-accent1-text", hover: "from-sky-500 via-blue-600 to-blue-800" },
  { dotVar: "--landing-stats-accent2-dot", textVar: "--landing-stats-accent2-text", hover: "from-blue-500 via-indigo-600 to-indigo-800" },
  { dotVar: "--landing-stats-accent3-dot", textVar: "--landing-stats-accent3-text", hover: "from-indigo-500 via-violet-600 to-violet-800" },
  { dotVar: "--landing-stats-accent4-dot", textVar: "--landing-stats-accent4-text", hover: "from-violet-500 via-purple-600 to-purple-900" },
];

function useCountUp(target: number, run: boolean): number {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!run || target <= 0) return;
    startRef.current = performance.now();
    setCurrent(0);
    const tick = (now: number) => {
      const start = startRef.current ?? now;
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = easeOutExpo(progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [run, target]);
  return current;
}

export type StatsCardProps = {
  item: StatsItem;
  index: number;
  run: boolean;
  isHovered: boolean;
  anyHovered: boolean;
};

const StatsCard: React.FC<StatsCardProps> = ({ item, index, run, isHovered, anyHovered }) => {
  const parsed = parseStatValue(item.value);
  const target = parsed?.numeric ?? 0;
  const current = useCountUp(target, run);
  const displayValue = parsed ? `${current.toLocaleString()}${parsed.suffix}` : item.value;
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <div
      className={`relative flex flex-col overflow-hidden cursor-default transition-all duration-500 ${
        isHovered
          ? `bg-gradient-to-b ${accent.hover}`
          : anyHovered
          ? "bg-transparent opacity-50"
          : "bg-transparent"
      }`}
      style={{ minHeight: 360 }}
    >
      <div className="flex flex-col items-center pt-10">
        <div
          className="w-px h-14 transition-colors duration-300"
          style={{ backgroundColor: isHovered ? "rgba(255,255,255,0.4)" : "var(--landing-light-border)" }}
        />
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${isHovered ? "scale-125 shadow-lg" : ""}`}
          style={{
            backgroundColor: `var(${accent.dotVar})`,
            borderColor: isHovered ? "rgba(255,255,255,0.6)" : "var(--landing-light-border)"
          }}
        />
      </div>

      <div className="flex flex-col gap-4 px-8 lg:px-12 py-8 flex-1">
        <span
          className="text-5xl lg:text-7xl font-black tabular-nums tracking-tight leading-none transition-all duration-300"
          style={{ color: isHovered ? "white" : `var(${accent.textVar})` }}
        >
          {displayValue}
        </span>
        <p
          className="text-lg font-bold transition-colors duration-300"
          style={{ color: isHovered ? "white" : "var(--landing-light-heading)" }}
        >
          {item.label}
        </p>
        {item.description && (
          <p
            className="text-sm leading-relaxed font-light max-w-[220px] transition-colors duration-300"
            style={{ color: isHovered ? "rgba(255,255,255,0.9)" : "var(--landing-light-card-body)" }}
          >
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
