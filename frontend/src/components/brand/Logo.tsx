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
  const width = Math.round(iconSize * 1.3);
  
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon: Stylized CX Ribbon Logo */}
      <svg
        width={width}
        height={iconSize}
        viewBox="0 0 42 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="gradient-c-loop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="gradient-x-diag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* C Loop + Bottom-left to Top-right diagonal */}
        <path
          d="M 22 6 C 11 6 6 10 6 16 C 6 22 11 26 22 26 L 36 6"
          stroke={monochrome ? 'currentColor' : 'url(#gradient-c-loop)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Top-left to Bottom-right diagonal */}
        <path
          d="M 22 6 L 36 26"
          stroke={monochrome ? 'currentColor' : 'url(#gradient-x-diag)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Typography: CODEXPETRA */}
      {showText && (
        <span className="font-black text-lg tracking-wider text-slate-900 dark:text-white uppercase font-sans">
          CODEXPETRA
        </span>
      )}
    </div>
  );
};

export default Logo;

