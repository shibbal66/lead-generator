import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowUpRight, Mail } from "lucide-react";

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace(/^#/, "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#value", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-section-inner py-16 lg:py-20">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 pb-14 border-b" style={{ borderColor: "var(--landing-footer-border-strong)" }}>

          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:shadow-blue-500/60 transition-all duration-300">
                <BarChart3 size={18} className="text-white" />
              </div>
              <span className="landing-footer-heading text-base font-extrabold tracking-tight">LeadGen Pro</span>
            </Link>
            <p className="landing-footer-muted text-sm leading-relaxed max-w-xs font-light">
              The all-in-one lead generation platform built for modern sales teams.
            </p>
            <a
              href="mailto:support@leadgenpro.example.com"
              className="landing-footer-button group inline-flex items-center gap-2 w-fit rounded-2xl border px-4 py-2.5 text-sm font-semibold hover:border-blue-400/40 hover:bg-blue-500/10 transition-all duration-200"
            >
              <Mail size={14} className="text-blue-400" />
              support@leadgenpro.com
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </a>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div>
              <h3 className="landing-footer-muted text-xs font-bold uppercase tracking-widest mb-5">
                Navigate
              </h3>
              <nav className="flex flex-col gap-3">
                {NAV_LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => scrollToSection(e, href)}
                    className="landing-footer-link group flex items-center gap-1.5 text-sm transition-colors duration-200 w-fit"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-blue-400 transition-all duration-300 rounded-full" />
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="landing-footer-muted text-xs font-bold uppercase tracking-widest mb-5">
                Account
              </h3>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="landing-footer-link group flex items-center gap-1.5 text-sm transition-colors duration-200 w-fit">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-400 transition-all duration-300 rounded-full" />
                  Log in
                </Link>
                <Link to="/signup" className="landing-footer-link group flex items-center gap-1.5 text-sm transition-colors duration-200 w-fit">
                  <span className="w-0 group-hover:w-2 h-px bg-blue-400 transition-all duration-300 rounded-full" />
                  Sign up
                </Link>
              </div>
            </div>

            <div>
              <h3 className="landing-footer-muted text-xs font-bold uppercase tracking-widest mb-5">
                Contact
              </h3>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="landing-footer-button group inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold hover:border-blue-400/40 hover:bg-blue-500/10 transition-all duration-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Get in touch
                <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
              </a>
            
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col items-center gap-6">
          <Link to="/" className="group relative overflow-hidden">
            <span className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white/20 via-white/10 to-white/20 group-hover:from-blue-400/40 group-hover:via-white/20 group-hover:to-indigo-400/40 transition-all duration-500 select-none">
              LeadGen Pro
            </span>
          </Link>
          <p className="landing-footer-muted text-xs tracking-wide">
            © {currentYear} LeadGen Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;