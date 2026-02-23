import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  DollarSign,
  BarChart3,
  MessageSquare,
  LucideIcon
} from "lucide-react";
import LandingDarkBackground from "./LandingDarkBackground";
import { landingValue } from "@/data/landing";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  DollarSign,
  BarChart3,
  MessageSquare
};

const iconClasses: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white",
  indigo: "bg-indigo-500/20 text-indigo-400 group-hover:bg-white/20 group-hover:text-white",
  amber: "bg-amber-500/20 text-amber-400 group-hover:bg-white/20 group-hover:text-white",
  emerald: "bg-emerald-500/20 text-emerald-400 group-hover:bg-white/20 group-hover:text-white",
  violet: "bg-violet-500/20 text-violet-400 group-hover:bg-white/20 group-hover:text-white",
  slate: "bg-gray-500/20 text-gray-400 group-hover:bg-white/20 group-hover:text-white"
};

const ValueSection: React.FC = () => {
  const d = landingValue;
  return (
    <LandingDarkBackground
      id="value"
      className="py-20 lg:py-28 scroll-mt-20"
    >
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="landing-dark-badge inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse landing-dark-accent" style={{ backgroundColor: "var(--landing-dark-accent)" }} aria-hidden />
          Features
        </span>
        <h2 className="landing-dark-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
          {d.title}<span className="landing-dark-accent">{d.titleAccent}</span>
        </h2>
        <p className="landing-dark-description mt-4 text-lg leading-relaxed">{d.description}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {d.features.map((feature) => {
          const Icon = iconMap[feature.icon] ?? LayoutDashboard;
          return (
            <div
              key={feature.title}
              className="group rounded-2xl border-2 p-6 lg:p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-blue-500/20 hover:border-transparent"
              style={{ borderColor: "var(--landing-dark-card-border)", backgroundColor: "var(--landing-dark-card-bg)" }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${iconClasses[feature.color]}`}
              >
                <Icon size={22} />
              </div>
              <h3 className="landing-dark-heading mt-4 text-lg font-bold group-hover:text-white">
                {feature.title}
              </h3>
              <p className="landing-dark-description mt-2 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </LandingDarkBackground>
  );
};

export default ValueSection;
