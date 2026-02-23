import React, { useEffect, useRef, useState } from "react";
import { Target, Users, TrendingUp, LucideIcon } from "lucide-react";
import { landingAbout } from "@/data/landing";

const cardIcons: LucideIcon[] = [Target, Users, TrendingUp];

const cardThemeClasses = [
  { wrapper: "landing-about-card-1", iconVar: "--landing-about-card1-icon", badgeVar: "--landing-about-card1-badge", badgeTextVar: "--landing-about-card1-badge-text", tag: "●" },
  { wrapper: "landing-about-card-2", iconVar: "--landing-about-card2-icon", badgeVar: "--landing-about-card2-badge", badgeTextVar: "--landing-about-card2-badge-text", tag: "◆" },
  { wrapper: "landing-about-card-3", iconVar: "--landing-about-card3-icon", badgeVar: "--landing-about-card3-badge", badgeTextVar: "--landing-about-card3-badge-text", tag: "▲" },
];

const AboutSection: React.FC = () => {
  const d = landingAbout;
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !lineRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const lineTrack = lineRef.current;
      const trackRect = lineTrack.getBoundingClientRect();
      const trackHeight = trackRect.height;

      const viewportCenter = window.innerHeight * 0.6;
      const progress = Math.max(0, Math.min(1, (viewportCenter - trackRect.top) / trackHeight));
      setLineHeight(progress * 100);

      let active = -1;
      cardRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.65) active = i;
      });
      setActiveIndex(active);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-20 lg:py-28 landing-section-bg scroll-mt-20 overflow-hidden">
      <div className="landing-section-inner">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="landing-light-overline inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--landing-light-overline-dot)" }} aria-hidden />
            Who we are
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: "var(--landing-about-heading)" }}
          >
            {d.title}
          </h2>
          <p
            className="mt-4 text-base leading-relaxed font-light max-w-xl mx-auto"
            style={{ color: "var(--landing-about-description)" }}
          >
            {d.description}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div ref={lineRef} className="relative">
            <div
              className="absolute left-[27px] top-0 bottom-0 w-0.5 rounded-full"
              style={{ backgroundColor: "var(--landing-about-line-track)" }}
            />
            <div
              className="absolute left-[27px] top-0 w-0.5 rounded-full transition-none shadow-sm"
              style={{
                height: `${lineHeight}%`,
                background: "linear-gradient(to bottom, var(--landing-about-line-fill-from), var(--landing-about-line-fill-via), var(--landing-about-line-fill-to))"
              }}
            />

            <div className="flex flex-col gap-6">
              {d.cards.map((card, i) => {
                const Icon = cardIcons[i] ?? Target;
                const t = cardThemeClasses[i] ?? cardThemeClasses[0];
                const isActive = activeIndex >= i;

                return (
                  <div
                    key={card.title}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="flex items-start gap-6"
                  >
                    <div className="relative shrink-0 flex flex-col items-center" style={{ width: 56 }}>
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-white shadow-lg text-white ${
                          isActive ? "shadow-xl scale-110" : "shadow-sm scale-100"
                        }`}
                        style={{
                          backgroundColor: isActive ? `var(${t.iconVar})` : "var(--landing-about-icon-inactive-bg)",
                          color: isActive ? "white" : "var(--landing-about-icon-inactive-text)"
                        }}
                      >
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                    </div>

                    <div
                      className={`group flex-1 rounded-3xl border-2 p-6 lg:p-7 flex flex-col gap-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-default ${t.wrapper} ${
                        isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="landing-about-card-title text-lg font-extrabold transition-colors duration-200">
                          {card.title}
                        </h3>
                        <span className="landing-about-tag text-lg font-black select-none transition-opacity duration-300">
                          {t.tag}
                        </span>
                      </div>

                      <p
                        className="text-sm leading-relaxed font-light"
                        style={{ color: "var(--landing-about-card-body-text)" }}
                      >
                        {card.description}
                      </p>

                      <div className="mt-auto pt-1">
                        <span
                          className="inline-block text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `var(${t.badgeVar})`, color: `var(${t.badgeTextVar})` }}
                        >
                          0{i + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;