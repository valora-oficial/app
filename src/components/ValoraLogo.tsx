import React from 'react';

interface ValoraLogoProps {
  className?: string;
  size?: number;
}

export const ValoraLogo: React.FC<ValoraLogoProps> = ({
  className = 'w-10 h-10',
  size = 40,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-xs select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Logo de VALORA"
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Base background gradient */}
          <linearGradient id="vBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#131b2e" />
          </linearGradient>

          {/* Left wing gradient: Cyan / Sky representing foreign currency (USD/EUR) */}
          <linearGradient id="vCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Right wing gradient: Gold / Amber representing Bolívares / Value */}
          <linearGradient id="vGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Core glow */}
          <radialGradient id="vGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle container background */}
        <rect width="100" height="100" rx="22" fill="url(#vBgGrad)" />
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="21"
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />

        {/* Subtle internal glow */}
        <circle cx="50" cy="50" r="38" fill="url(#vGlow)" />

        {/* Stylized 'V' Left Arm (Forward Slant) */}
        <path
          d="M24 24 L42 76 L52 76 L34 24 Z"
          fill="url(#vCyanGrad)"
        />

        {/* Stylized 'V' Right Arm (Upward Financial Momentum) */}
        <path
          d="M48 76 L76 24 L66 24 L42 76 Z"
          fill="url(#vGoldGrad)"
        />

        {/* Apex Conversion Node (Center bottom) */}
        <circle cx="47" cy="74" r="5" fill="#ffffff" />
        <circle cx="47" cy="74" r="2.5" fill="#0284c7" />

        {/* Currency Exchange Arrows in negative space */}
        {/* Upper right pointing right */}
        <path
          d="M42 36 L58 36 M52 30 L58 36 L52 42"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lower right pointing left */}
        <path
          d="M58 48 L42 48 M48 42 L42 48 L48 54"
          stroke="#fde047"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
