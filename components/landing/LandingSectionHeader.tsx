import React from "react";

type Variant = "dark" | "light";

type LandingSectionHeaderProps = {
  overline?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  variant?: Variant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const LandingSectionHeader: React.FC<LandingSectionHeaderProps> = ({
  overline,
  title,
  titleAccent,
  subtitle,
  variant = "dark",
  className = "",
  titleClassName = "",
  subtitleClassName = ""
}) => {
  const isDark = variant === "dark";
  const titleClass =
    titleClassName ||
    (isDark ? "landing-title-dark" : "landing-title-light");
  const subtitleClass =
    subtitleClassName ||
    (isDark ? "landing-subtitle-dark" : "landing-subtitle-light");

  return (
    <div className={`text-center mx-auto ${className}`}>
      {overline && (
        <p className={isDark ? "landing-overline-dark" : "landing-overline-light"}>
          {isDark && <span className="w-2 h-2 rounded-full bg-blue-400" aria-hidden />}
          {overline}
        </p>
      )}
      {title ? (
        <h2 className={titleClass}>
          {title}
          {titleAccent && <span className="landing-title-accent">{titleAccent}</span>}
        </h2>
      ) : null}
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
    </div>
  );
};

export default LandingSectionHeader;
