import React, { useEffect, useRef, useState } from "react";
import { landingStats } from "@/data/landing";
import StatsCard from "./StatsCard";

type StatsData = { overline?: string; title?: string; items: { value: string; label: string; description?: string }[] };

const StatsSection: React.FC = () => {
  const d = landingStats as StatsData;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [inView, setInView] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated) {
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasAnimated]);

  return (
    <section id="stats" ref={sectionRef} className="landing-section-bg border-y overflow-hidden scroll-mt-20" style={{ borderColor: "var(--landing-light-border)" }}>
      {(d.overline || d.title) && (
        <div className="text-center max-w-3xl mx-auto py-16 px-4">
          {d.overline && (
            <span className="landing-light-overline inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--landing-light-overline-dot)" }} aria-hidden />
              {d.overline}
            </span>
          )}
          {d.title && (
            <h2 className="landing-light-heading text-4xl sm:text-5xl font-black tracking-tight mt-3">
              {d.title}
            </h2>
          )}
        </div>
      )}

      <div className="relative border-t w-full" style={{ borderColor: "var(--landing-light-border)" }}>
        <div className="absolute top-[96px] inset-x-0 h-px z-0 pointer-events-none" style={{ backgroundColor: "var(--landing-light-border)" }} />

        <div
          className="grid grid-cols-2 lg:grid-cols-4 w-full divide-x divide-[var(--landing-light-border)]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {d.items.map((item, i) => (
            <div key={item.label} onMouseEnter={() => setHoveredIndex(i)}>
              <StatsCard
                item={item}
                index={i}
                run={inView}
                isHovered={hoveredIndex === i}
                anyHovered={hoveredIndex !== null}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
