import React, { useState, useMemo } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { landingFaq } from "@/data/landing";

type FlatItem = { q: string; a: string; key: string };

const FAQSection: React.FC = () => {
  const d = landingFaq;
  const flatItems = useMemo<FlatItem[]>(() => {
    const list: FlatItem[] = [];
    d.groups.forEach((group, gi) =>
      group.items.forEach((item, ii) => {
        list.push({ ...item, key: `${gi}-${ii}-${item.q}` });
      })
    );
    return list;
  }, [d.groups]);

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (index: number) => setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section id="faq" className="py-20 lg:py-28 landing-section-bg scroll-mt-20">
      <div className="landing-section-inner">
        <div className="text-center max-w-2xl mx-auto mb-14">
          {d.overline && (
            <span className="landing-light-overline inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--landing-light-overline-dot)" }} aria-hidden />
              {d.overline}
            </span>
          )}
          <h2 className="landing-light-heading text-4xl sm:text-5xl font-black tracking-tight leading-tight mt-3">
            {d.title}
          </h2>
          {d.subtitle && (
            <p className="landing-light-description mt-4 text-base leading-relaxed font-light">
              {d.subtitle}
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {flatItems.map((item, index) => {
            const isOpen = openIndex === index;
            const num = String(index + 1).padStart(2, "0");
            return (
              <div
                key={item.key}
                className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isOpen ? "landing-faq-card-open shadow-lg" : "landing-faq-card-closed hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isOpen ? "landing-faq-num-open shadow-md" : "landing-faq-num-closed"
                  }`}>
                    {num}
                  </span>

                  <span className={`flex-1 text-base sm:text-lg font-bold transition-colors duration-200 ${
                    isOpen ? "landing-faq-question-open" : "landing-faq-question-closed"
                  }`}>
                    {item.q}
                  </span>

                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen ? "landing-faq-num-open rotate-0" : "landing-faq-num-closed"
                  }`}>
                    {isOpen ? <Minus size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
                  </span>
                </button>

                <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0 flex gap-4">
                      <div className="landing-faq-answer-bar shrink-0 w-0.5 rounded-full ml-[14px]" />
                      <p className="landing-faq-answer leading-relaxed text-sm sm:text-base font-light">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;