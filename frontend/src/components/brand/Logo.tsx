import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  monochrome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconSize = 24,
  showText = true,
  monochrome = false,
}) => {
  const gradientId = 'codexpetra-gradient';
  
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon: Abstract faceted tech prism representing Codex + Petra */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#8a2be2'} />
            <stop offset="50%" stopColor={monochrome ? 'currentColor' : '#6366f1'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#3b82f6'} />
          </linearGradient>
        </defs>
        
        {/* Outer Hexagon outline representing rock structure (Petra) */}
        <path
          d="M6 10L16 4L26 10V22L16 28L6 22V10Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inside facet lines representing structure (Codex) */}
        <path
          d="M16 4V16L26 22"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeDasharray="1 1"
        />
        <path
          d="M16 16L6 22"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Glowing technology dot core */}
        <circle
          cx="16"
          cy="16"
          r="3"
          fill={monochrome ? 'currentColor' : '#10b981'}
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Codex<span className="text-blue-600 dark:text-blue-400">Petra</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
