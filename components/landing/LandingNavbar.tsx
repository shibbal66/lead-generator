import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#value", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" }
] as const;

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace(/^#/, "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const LandingNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDark
          ? "bg-gray-900/80 backdrop-blur-md border-b border-white/5"
          : "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold tracking-tight transition-transform hover:scale-105 active:scale-100 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${isDark ? "bg-blue-500 shadow-blue-500/30" : "bg-blue-600 shadow-blue-500/25"}`}>
              <BarChart3 className="text-white" size={20} />
            </div>
            <span className="text-lg">LeadGen Pro</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => scrollToSection(e, href)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${isDark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"}`}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-100 transition-all duration-300"
            >
              Sign up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors ${isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className={`lg:hidden py-4 border-t ${isDark ? "border-white/10" : "border-gray-100"} animate-fade-in-up`}>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => {
                    scrollToSection(e, href);
                    setMobileOpen(false);
                  }}
                  className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? "text-gray-300 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  {label}
                </a>
              ))}
              <div className={`mt-4 pt-4 flex flex-col gap-2 ${isDark ? "border-white/10" : "border-gray-100"} border-t`}>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-semibold text-center rounded-xl border-2 transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"}`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-white bg-blue-500 text-center rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-400 transition-all"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
