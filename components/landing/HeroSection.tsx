import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Sparkles, ShieldCheck, ArrowRight, TrendingUp, Zap, Users, LucideIcon } from "lucide-react";
import LandingDarkBackground from "./LandingDarkBackground";
import { landingHero } from "@/data/landing";

const bulletIconMap: Record<string, LucideIcon> = {
  Sparkles,
  ShieldCheck,
};

const HeroSection: React.FC = () => {
  const d = landingHero;

  return (
    <LandingDarkBackground
      id="home"
      className="min-h-[90vh] flex items-center scroll-mt-20"
      contentClassName="py-24 lg:py-32"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        <div className="animate-fade-in-up">
          <div className="landing-dark-badge inline-flex items-center gap-2 rounded-2xl px-4 py-2 mb-5">
            <BarChart3 size={16} className="landing-dark-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">{d.badge}</span>
          </div>

          <p className="landing-dark-accent text-xs font-bold uppercase tracking-[0.2em] mb-4">{d.tagline}</p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
            <span className="landing-dark-heading">{d.headlinePrefix}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {d.headlineAccent}
            </span>
          </h1>

          <p className="landing-dark-description mt-6 text-base leading-relaxed max-w-lg font-light">
            {d.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-extrabold text-white shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.97] transition-all duration-300"
              style={{ backgroundColor: "var(--landing-dark-cta-primary-bg)" }}
            >
              {d.ctaPrimary}
              <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <a
              href="#value"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("value")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300"
              style={{ borderColor: "var(--landing-dark-cta-secondary-border)", backgroundColor: "var(--landing-dark-cta-secondary-bg)" }}
            >
              {d.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl border shadow-2xl overflow-hidden animate-float backdrop-blur-sm bg-gradient-to-br from-blue-600/80 to-indigo-800/80" style={{ borderColor: "var(--landing-dark-card-border)" }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white gap-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur border border-white/20 shadow-xl">
                  <BarChart3 size={38} className="text-white" />
                </div>
                <p className="text-base font-semibold text-white/90 text-center">{d.visualCaption}</p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
                  {[
                    { icon: TrendingUp, label: "Growth", val: "+48%" },
                    { icon: Users, label: "Leads", val: "2.4k" },
                    { icon: Zap, label: "Speed", val: "99ms" },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 border border-white/10 p-3 hover:bg-white/15 transition-colors duration-200">
                      <Icon size={14} className="text-blue-300" />
                      <span className="text-xs font-black text-white">{val}</span>
                      <span className="text-[10px] text-white/50">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>

            <div className="absolute -right-5 top-1/4 rounded-2xl bg-blue-500 border border-blue-400/40 px-4 py-2 shadow-xl shadow-blue-500/30 text-xs font-bold text-white animate-float flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {d.visualPill1}
            </div>
            <div className="absolute -left-5 bottom-1/4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 px-4 py-2 text-xs font-bold text-white animate-float flex items-center gap-1.5" style={{ animationDelay: "1.5s" }}>
              <Zap size={12} className="text-amber-400" />
              {d.visualPill2}
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-3">
            {d.bullets.map((bullet, i) => {
              const Icon = bulletIconMap[bullet.icon] ?? Sparkles;
              return (
                <div
                  key={bullet.text}
                  className="group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 hover:border-blue-400/30 transition-all duration-200 cursor-default"
                  style={{ borderColor: "var(--landing-dark-card-border)", backgroundColor: "var(--landing-dark-card-bg)" }}
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${i === 0 ? "bg-blue-500/20 text-blue-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                    <Icon size={14} />
                  </span>
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-200 font-light">
                    {bullet.text}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </LandingDarkBackground>
  );
};

export default HeroSection;