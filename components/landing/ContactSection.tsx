import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, UserPlus, Sparkles, Zap } from "lucide-react";
import LandingDarkBackground from "./LandingDarkBackground";
import { landingContact } from "@/data/landing";

const ContactSection: React.FC = () => {
  const d = landingContact;

  return (
    <LandingDarkBackground id="contact" className="py-20 lg:py-28 scroll-mt-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        <div className="animate-fade-in-up">
          <div className="group/title inline-block">
            <div className="landing-dark-badge inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 landing-dark-accent" style={{ backgroundColor: "var(--landing-dark-accent)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2 landing-dark-accent" style={{ backgroundColor: "var(--landing-dark-accent)" }} />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest">{d.badge}</p>
            </div>
            <h2 className="landing-dark-heading text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]">
              {d.title}
            </h2>
            <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 w-0 group-hover/title:w-full transition-all duration-500 ease-out" />
          </div>

          <p className="landing-dark-description mt-5 text-base leading-relaxed max-w-md font-light">
            {d.description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300 font-medium">We usually reply within 24 hours.</p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-blue-400/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              style={{ borderColor: "var(--landing-dark-card-border)", backgroundColor: "var(--landing-dark-card-bg)" }}
            >
              {d.loginPrompt}
              <span className="landing-dark-accent group-hover:underline">{d.loginLink}</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {d.options.map((opt, i) => {
            const isMailto = opt.href.startsWith("mailto:");
            const Icon = isMailto ? Mail : UserPlus;
            const ActionIcon = isMailto ? Mail : ArrowRight;

            const cardClass =
              "group relative block rounded-3xl border-2 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-white/8 active:scale-[0.99] animate-fade-in-up overflow-hidden";

            const content = (
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/20 text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-blue-500/40">
                  <Icon size={22} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="landing-dark-heading text-lg font-extrabold">{opt.title}</h3>
                    <Zap size={13} className="landing-dark-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <p className="landing-dark-description text-sm leading-relaxed font-light group-hover:text-gray-300 transition-colors">
                    {opt.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-600/40 group-hover:scale-[1.04]">
                    {opt.action}
                    <ActionIcon
                      size={15}
                      className={isMailto ? "group-hover:scale-110 transition-transform duration-200" : "group-hover:translate-x-1 transition-transform duration-200"}
                    />
                  </span>
                </div>

                <span className="absolute top-4 right-5 text-3xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-300 select-none">
                  0{i + 1}
                </span>
              </div>
            );

            const cardStyle = { animationDelay: `${i * 80}ms`, borderColor: "var(--landing-dark-card-border)", backgroundColor: "var(--landing-dark-card-bg)" };
            return isMailto ? (
              <a key={opt.title} href={opt.href} className={cardClass} style={cardStyle}>
                {content}
              </a>
            ) : (
              <Link key={opt.title} to={opt.href} className={cardClass} style={cardStyle}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </LandingDarkBackground>
  );
};

export default ContactSection;