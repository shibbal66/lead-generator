import React from "react";

type LandingDarkBackgroundProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  contentClassName?: string;
  withOrbs?: boolean;
};


const LandingDarkBackground: React.FC<LandingDarkBackgroundProps> = ({
  children,
  id,
  className = "",
  contentClassName = "",
  withOrbs = true
}) => {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: "var(--landing-dark-bg)" }}
    >
      <div className="absolute inset-0 opacity-[0.07] landing-dark-grid" aria-hidden />
      {withOrbs && (
        <>
          <div
            className="absolute top-0 right-0 w-[50%] max-w-2xl h-[80%] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-float"
            style={{ backgroundColor: "var(--landing-dark-orb-blue)" }}
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 w-[45%] max-w-xl h-[60%] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-float"
            style={{ backgroundColor: "var(--landing-dark-orb-indigo)", animationDelay: "1s" }}
            aria-hidden
          />
          <div
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: "var(--landing-dark-orb-blue)", opacity: 0.5 }}
            aria-hidden
          />
        </>
      )}
      <div className={`relative z-10 landing-section-inner ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
};

export default LandingDarkBackground;
