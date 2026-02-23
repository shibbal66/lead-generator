import React from "react";

type LandingGradientCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "a";
  href?: string;
};

const LandingGradientCard: React.FC<LandingGradientCardProps> = ({
  children,
  className = "",
  as: Component = "div",
  href
}) => {
  const baseClass = "landing-gradient-card p-6 lg:p-8 text-left group";
  const combined = `${baseClass} ${className}`.trim();
  if (Component === "a" && href) {
    return <a href={href} className={combined}>{children}</a>;
  }
  return <div className={combined}>{children}</div>;
};

export default LandingGradientCard;
