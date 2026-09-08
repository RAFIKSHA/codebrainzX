import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

// 1. Python (Official Blue & Yellow Snakes)
export const PythonLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="pyGradA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#387eb8" />
        <stop offset="100%" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="pyGradB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffe873" />
        <stop offset="100%" stopColor="#ffd43b" />
      </linearGradient>
    </defs>
    <path
      fill="url(#pyGradA)"
      d="M63.5 12c-27.4 0-25.7 11.9-25.7 11.9l.1 12.3h26.2v3.7H27.5C15.6 39.9 5 53.6 5 66.5c0 14.8 10.3 24.3 23.6 24.3h7.6V79.2c0-13.4 11.6-13.4 11.6-13.4h25.8c11.3 0 11.3-11 11.3-11V24.5s2.2-12.5-21.4-12.5zm-14.7 7.6a4.1 4.1 0 1 1 0 8.2 4.1 4.1 0 0 1 0-8.2z"
    />
    <path
      fill="url(#pyGradB)"
      d="M64.5 116c27.4 0 25.7-11.9 25.7-11.9l-.1-12.3H63.9v-3.7h36.6c11.9 0 22.5-13.7 22.5-26.6 0-14.8-10.3-24.3-23.6-24.3h-7.6v11.6c0 13.4-11.6 13.4-11.6 13.4H45c-11.3 0-11.3 11-11.3 11v30.3s-2.2 12.5 21.4 12.5zm14.7-7.6a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2z"
    />
  </svg>
);

// 2. Java (Official Red Steam Coffee Cup + Blue Base)
export const JavaLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <path
      fill="#ea2d2e"
      d="M48.2 96.6s-6.3 3.6 4.3 4.8c12.9 1.5 19.5 1.3 33.8-1.4 0 0 4.8 3.1 11.5 5.7-27.1 11.4-65.7-1.1-49.6-9.1z"
    />
    <path
      fill="#ea2d2e"
      d="M41.8 84.1s-7.3 5.3 3.6 6.5c14.7 1.6 25.9 2 45.4-2.4 0 0 3.3 2.7 8.3 4.5-33.1 11-73.4.9-57.3-8.6z"
    />
    <path
      fill="#0074bd"
      d="M74.8 63.8c5.4 6.2-1.4 11.8-1.4 11.8s13.8-7.1 7.4-16.1c-6.1-8.5-10.8-12.7-21.7-23.3 0 0 3.3 5.4 6.4 9.1 4.1 4.9 6.8 9.3 9.3 18.5z"
    />
    <path
      fill="#ea2d2e"
      d="M99.5 106.8s5.3 4.3-5.8 7.6c-21.5 6.4-44.8 6.7-65.3 0-6.1-2-1.2-5.4-1.2-5.4s4.8 3.6 22.9 4.8c22.5 1.5 40.5.2 49.4-7z"
    />
    <path
      fill="#0074bd"
      d="M43.9 123.6c23.6 1.5 49.5-.8 62.4-7.4 0 0-3.5 2.8-10.1 4.8-15.6 4.7-37.4 5.3-52.3 2.6z"
    />
    <path
      fill="#ea2d2e"
      d="M87.3 46.8s15.3-15.8-14.7-30.8c0 0 4.1 6.5-1.9 14.1-7.1 9-8.4 13.9-1.9 23.4 0 0-2.8-5.3-.2-9.6 2.6-4.2 8.7-10.6 18.7 2.9z"
    />
    <path
      fill="#0074bd"
      d="M93.8 92.5c14.2-11.2 7.7-22.1 3.1-20.9-1.1.3-1.6.8-1.6.8s.8-.8 2.2-1.3c8-2.6 14.3 11.2-4.2 22.1 0 0 .5-.4.5-.7z"
    />
  </svg>
);

// 3. C++ (Official Dark Blue Hexagon / Shield + White C++)
export const CppLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <path
      fill="#00599C"
      d="M116.5 33.7L66.7 5c-1.7-1-3.8-1-5.5 0L11.5 33.7c-1.7 1-2.8 2.8-2.8 4.7v57.4c0 1.9 1 3.7 2.8 4.7l49.7 28.7c1.7 1 3.8 1 5.5 0l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#004482"
      d="M116.5 33.7L64 64v61.7c1-.2 1.9-.7 2.7-1.2l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#659AD2"
      d="M64 64L11.5 33.7c1.7-1 3.8-1 5.5 0L64 61.2l47-27.5c1.7-1 3.8-1 5.5 0L64 64z"
    />
    {/* C Graphic */}
    <path
      fill="#FFFFFF"
      d="M60.4 46.2c-10.2 0-18.5 8.3-18.5 18.5s8.3 18.5 18.5 18.5c6.5 0 12.3-3.4 15.6-8.5l-8.4-4.8c-1.6 2.8-4.6 4.6-8.1 4.6-5.1 0-9.2-4.1-9.2-9.2s4.1-9.2 9.2-9.2c3.4 0 6.4 1.8 8.1 4.6l8.4-4.8c-3.4-5.3-9.2-8.7-15.6-8.7z"
    />
    {/* Plus 1 */}
    <path
      fill="#FFFFFF"
      d="M87.5 59.8h-3.3v-3.3h-2.7v3.3h-3.3v2.7h3.3v3.3h2.7v-3.3h3.3v-2.7z"
    />
    {/* Plus 2 */}
    <path
      fill="#FFFFFF"
      d="M101.5 59.8h-3.3v-3.3h-2.7v3.3h-3.3v2.7h3.3v3.3h2.7v-3.3h3.3v-2.7z"
    />
  </svg>
);

// 4. JavaScript (Official Yellow Badge + Black JS)
export const JavaScriptLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <rect width="128" height="128" rx="16" fill="#F7DF1E" />
    <path
      fill="#000000"
      d="M34.8 105.8c4.3 2.5 9.7 4.1 15.5 4.1 13.9 0 22.8-7 22.8-21.4V46.6H58.6v41.7c0 7.3-3.6 10.9-9.5 10.9-4.2 0-7.7-1.5-9.8-3.1l-4.5 9.7zm50.9-1.3c6 3.4 14.1 5.4 22.7 5.4 16.5 0 26.6-8.4 26.6-22.3 0-12.7-8.1-18.4-18.7-22.9-7.5-3.3-10.7-5.9-10.7-10.1 0-3.9 3.3-7.2 9.4-7.2 4.9 0 9.2 1.7 12.3 3.6l4-9.9c-3.9-2.2-9.7-3.6-16.4-3.6-15.6 0-25.2 8.6-25.2 21.6 0 12.7 8.7 18.6 19.5 23.2 7.1 3.1 9.9 5.8 9.9 9.8 0 4.6-4.1 8-11.1 8-6.1 0-11.7-2.3-15.5-5.1l-4.3 10.1z"
    />
  </svg>
);

// 5. C (Official Blue Shield + White C)
export const CLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <path
      fill="#00599C"
      d="M116.5 33.7L66.7 5c-1.7-1-3.8-1-5.5 0L11.5 33.7c-1.7 1-2.8 2.8-2.8 4.7v57.4c0 1.9 1 3.7 2.8 4.7l49.7 28.7c1.7 1 3.8 1 5.5 0l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#004482"
      d="M116.5 33.7L64 64v61.7c1-.2 1.9-.7 2.7-1.2l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#659AD2"
      d="M64 64L11.5 33.7c1.7-1 3.8-1 5.5 0L64 61.2l47-27.5c1.7-1 3.8-1 5.5 0L64 64z"
    />
    <path
      fill="#FFFFFF"
      d="M64 42.5c-12.8 0-23.2 10.4-23.2 23.2S51.2 88.9 64 88.9c8.2 0 15.5-4.3 19.6-10.7l-10.6-6c-2 3.5-5.8 5.8-10.2 5.8-6.4 0-11.6-5.2-11.6-11.6s5.2-11.6 11.6-11.6c4.3 0 8.1 2.3 10.2 5.8l10.6-6C79.5 46.8 72.2 42.5 64 42.5z"
    />
  </svg>
);

// 6. C# (Official Purple Hexagon + C#)
export const CSharpLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <path
      fill="#68217A"
      d="M116.5 33.7L66.7 5c-1.7-1-3.8-1-5.5 0L11.5 33.7c-1.7 1-2.8 2.8-2.8 4.7v57.4c0 1.9 1 3.7 2.8 4.7l49.7 28.7c1.7 1 3.8 1 5.5 0l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#501860"
      d="M116.5 33.7L64 64v61.7c1-.2 1.9-.7 2.7-1.2l49.7-28.7c1.7-1 2.8-2.8 2.8-4.7V38.4c.1-1.9-.9-3.7-2.7-4.7z"
    />
    <path
      fill="#8E3C9E"
      d="M64 64L11.5 33.7c1.7-1 3.8-1 5.5 0L64 61.2l47-27.5c1.7-1 3.8-1 5.5 0L64 64z"
    />
    <path
      fill="#FFFFFF"
      d="M59.4 46.2c-10.2 0-18.5 8.3-18.5 18.5s8.3 18.5 18.5 18.5c6.5 0 12.3-3.4 15.6-8.5l-8.4-4.8c-1.6 2.8-4.6 4.6-8.1 4.6-5.1 0-9.2-4.1-9.2-9.2s4.1-9.2 9.2-9.2c3.4 0 6.4 1.8 8.1 4.6l8.4-4.8c-3.4-5.3-9.2-8.7-15.6-8.7z"
    />
    <path
      fill="#FFFFFF"
      d="M87.5 59.8h-2.1l.6-2.9h-2.7l-.6 2.9h-2.7l.6-2.9h-2.7l-.6 2.9h-2.1v2.7h2.1l-.6 3.1h-2.1v2.7h2.1l-.6 2.9h2.7l.6-2.9h2.7l-.6 2.9h2.7l.6-2.9h2.1v-2.7h-2.1l.6-3.1h2.1v-2.7zm-4.7 5.8h-2.7l.6-3.1h2.7l-.6 3.1z"
    />
  </svg>
);

// 7. PHP (Official Blue/Purple Oval with php)
export const PhpLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <ellipse cx="64" cy="64" rx="60" ry="38" fill="#777BB4" />
    <ellipse cx="64" cy="64" rx="56" ry="34" fill="#8892BF" />
    <path
      fill="#FFFFFF"
      d="M37.3 54h8.5c4.7 0 7.8 2.7 7.2 6.8-.7 4.7-4.8 7.4-9.5 7.4h-5.1l-2.6 15.8h-7.6l9.1-30zm6.9 8.8c.3-1.6-.6-2.7-2.3-2.7h-2.7l-1 5.9h2.5c2 0 3.2-1.3 3.5-3.2zm16.5-8.8h7.6l-2.4 14.5c1.4-1.9 3.6-3.3 6.6-3.3 5.4 0 8.3 3.7 7.5 9.1l-1.6 9.7h-7.6l1.4-8.8c.4-2.5-.7-4.2-3-4.2-2.4 0-4.3 1.9-4.8 4.7l-1.4 8.3h-7.6l5.3-30zm27.8 0h8.5c4.7 0 7.8 2.7 7.2 6.8-.7 4.7-4.8 7.4-9.5 7.4h-5.1l-2.6 15.8h-7.6l9.1-30zm6.9 8.8c.3-1.6-.6-2.7-2.3-2.7h-2.7l-1 5.9h2.5c2 0 3.2-1.3 3.5-3.2z"
    />
  </svg>
);

// 8. SQL (Database Cylinder + Query Badge)
export const SqlLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="sqlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00758F" />
        <stop offset="100%" stopColor="#005B70" />
      </linearGradient>
    </defs>
    {/* Cylinder Base 3 */}
    <path
      fill="url(#sqlGrad)"
      d="M20 76c0 14.4 19.7 26 44 26s44-11.6 44-26v22c0 14.4-19.7 26-44 26s-44-11.6-44-26V76z"
    />
    {/* Cylinder Base 2 */}
    <path
      fill="#008CA8"
      d="M20 48c0 14.4 19.7 26 44 26s44-11.6 44-26v22c0 14.4-19.7 26-44 26s-44-11.6-44-26V48z"
    />
    {/* Cylinder Top */}
    <path
      fill="#00B4D8"
      d="M20 28c0 14.4 19.7 26 44 26s44-11.6 44-26C108 13.6 88.3 2 64 2S20 13.6 20 28z"
    />
    {/* Badge SQL text */}
    <rect x="28" y="52" width="72" height="28" rx="6" fill="#002D38" />
    <text
      x="64"
      y="71"
      textAnchor="middle"
      fill="#00E5FF"
      fontSize="16"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      letterSpacing="1"
    >
      SQL
    </text>
  </svg>
);

// 9. HTML & CSS (Dual Orange HTML5 + Blue CSS3 Shields)
export const HtmlCssLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    {/* HTML5 Shield on Left */}
    <g transform="translate(4, 16) scale(0.85)">
      <path fill="#E44D26" d="M12 0l7.3 82.3 35.7 9.9 35.7-9.9L98 0H12z" />
      <path fill="#F16529" d="M55 7.5v77.3l29.4-8.2 6.1-69.1H55z" />
      <path
        fill="#EBEBEB"
        d="M55 24H27.8l1.7 19.1H55V24zm0 26.6H38.5l1.1 12.8 15.4 4.2v7.8l-23-6.4-2.1-23.7h25.1v5.3z"
      />
      <path
        fill="#FFFFFF"
        d="M55 24h27.2l-2.4 26.6H55V45.3h18.9l1.1-12.8H55V24zm0 33.9v7.8l15.4-4.2 1.6-17.7H55v-5.3h24.7l-2.6 29-22.1 6.1z"
      />
    </g>
    {/* CSS3 Shield on Right */}
    <g transform="translate(46, 26) scale(0.85)">
      <path fill="#1572B6" d="M12 0l7.3 82.3 35.7 9.9 35.7-9.9L98 0H12z" />
      <path fill="#33A9DC" d="M55 7.5v77.3l29.4-8.2 6.1-69.1H55z" />
      <path
        fill="#EBEBEB"
        d="M55 24H27.8l3.6 40.5 23.6 6.5v-7.8l-16-4.4-1.2-13.6H55V38.9H35.3l-.7-7.5H55V24z"
      />
      <path
        fill="#FFFFFF"
        d="M55 24h27.2l-3.6 40.5-23.6 6.5v-7.8l16-4.4 2-22.2H55V24z"
      />
    </g>
  </svg>
);

// 10. Go (Golang Cyan Teal Speed Logo)
export const GoLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="goGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00ADD8" />
        <stop offset="100%" stopColor="#007D9C" />
      </linearGradient>
    </defs>
    {/* Three Speed Whiskers on Left */}
    <path fill="#00ADD8" d="M8 44h28v6H8zm-6 16h34v6H2zm8 16h28v6H10z" />
    {/* Letter G */}
    <path
      fill="url(#goGrad)"
      d="M74 38c-17.7 0-30 11.5-30 26s12.3 26 30 26c11.5 0 20.7-5.1 26-13.8l-10-5.8c-3.5 5.5-9.3 8.6-16 8.6-10.7 0-18-6.9-18-15s7.3-15 18-15c6.6 0 12.3 3 15.8 8.4l10-5.8C89.4 43.1 82.2 38 74 38z"
    />
    {/* Letter O */}
    <path
      fill="url(#goGrad)"
      d="M106 38c-14.4 0-24 11.6-24 26s9.6 26 24 26 24-11.6 24-26-9.6-26-24-26zm0 41c-7.7 0-12.8-6.7-12.8-15s5.1-15 12.8-15 12.8 6.7 12.8 15-5.1 15-12.8 15z"
    />
  </svg>
);

// 11. Kotlin (Official Geometric K Multi-color)
export const KotlinLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="ktGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0095D5" />
        <stop offset="25%" stopColor="#3C83DC" />
        <stop offset="50%" stopColor="#6D74E3" />
        <stop offset="75%" stopColor="#806EE3" />
        <stop offset="100%" stopColor="#C757BC" />
      </linearGradient>
    </defs>
    <path fill="url(#ktGrad)" d="M120 8H8v112h112L64 64l56-56z" />
    <path fill="#C757BC" d="M64 64L8 120h112L64 64z" />
    <path fill="#0095D5" d="M8 8v112l56-56L8 8z" />
    <path fill="#E86266" d="M8 8h112L64 64 8 8z" />
  </svg>
);

// 12. TypeScript (Official Blue Square + White TS)
export const TypeScriptLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <rect width="128" height="128" rx="16" fill="#3178C6" />
    <path
      fill="#FFFFFF"
      d="M38.5 56.6h17.9v47.2H68V56.6h17.9V44.2H38.5v12.4zm50.9 33.3c3.8 2.2 8.7 3.6 13.9 3.6 5.8 0 9.1-2.6 9.1-6.5 0-4.1-3.6-6-10.3-8.8-9.4-3.8-15.6-8.9-15.6-17.7 0-10.3 8.3-17.4 21.6-17.4 6.7 0 12.5 1.7 16.5 3.8l-3.3 9.7c-3.3-1.7-7.7-2.9-13.1-2.9-6.3 0-8.9 3-8.9 6 0 3.8 3.5 5.5 10.7 8.5 10.4 4.3 15.3 9.4 15.3 18.2 0 11.2-8.7 18-22.7 18-7.3 0-14.4-2.1-18.4-4.6l3.3-9.9z"
    />
  </svg>
);

// 13. Dart (Official Teal/Blue Origami Dart Glyph)
export const DartLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="dartG1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#01579B" />
        <stop offset="100%" stopColor="#0288D1" />
      </linearGradient>
      <linearGradient id="dartG2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00B0FF" />
        <stop offset="100%" stopColor="#00E5FF" />
      </linearGradient>
    </defs>
    <path fill="#29B6F6" d="M28 8L8 28l52 52 28-8-8-28L28 8z" />
    <path fill="url(#dartG1)" d="M60 80L8 28v72l20 20 52-20-20-20z" />
    <path fill="url(#dartG2)" d="M80 72l20 48 20-20V48L68 8l-8 24 20 40z" />
    <path fill="#0288D1" d="M28 120h72l20-20-40-28-52 48z" />
  </svg>
);

// 14. Swift (Official Orange Gradient + White Flying Bird)
export const SwiftLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="swiftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F05138" />
        <stop offset="100%" stopColor="#F88C22" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#swiftGrad)" />
    <path
      fill="#FFFFFF"
      d="M104.2 92.5c-15.6 15.5-39.7 18-59.5 7.4 20.3-6.5 35.8-21.7 41.2-40.4-11.8 11.2-27.1 17.6-43.2 17.7-1.1 0-2.2 0-3.3-.1 10.3-6.8 18.2-16.7 22.3-28.1-9.9 5.3-21 8.2-32.3 8.4-4.8.1-9.7-.4-14.4-1.5 19.8-13.8 44.4-18.4 68-12.8-13.1-6.1-28-7.7-42.3-4.5 12.3-8.8 27.2-13.5 42.6-13.4-23.7-2.3-47.5 7.8-62.8 26.6C8.2 73.1 14.6 96.5 34 109.8c23 15.8 54 13.5 74.4-5.3-1.4-4-2.8-8-4.2-12z"
    />
  </svg>
);

// 15. R (Official Grey Ellipse + Blue Capital R)
export const RLogo: React.FC<LogoProps> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <defs>
      <linearGradient id="rGradA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CBCBCB" />
        <stop offset="100%" stopColor="#8A8A8A" />
      </linearGradient>
      <linearGradient id="rGradB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#276DC3" />
        <stop offset="100%" stopColor="#165BA8" />
      </linearGradient>
    </defs>
    {/* Oval Ring */}
    <ellipse cx="64" cy="64" rx="56" ry="42" fill="none" stroke="url(#rGradA)" strokeWidth="16" />
    {/* R Letter */}
    <path
      fill="url(#rGradB)"
      d="M52 38h28c11.6 0 19.5 5.8 19.5 15.5 0 8.2-5.4 13.6-13.5 15l15.5 21.5H86.2L73 69.8h-7.8V90H52V38zm13.2 21.6h12.5c4.7 0 7.8-2.2 7.8-6.3 0-3.9-3.1-6.1-7.8-6.1H65.2v12.4z"
    />
  </svg>
);

// Map slug/identifier to Logo Component
export const getLanguageLogoComponent = (slug: string, size = 48) => {
  switch (slug.toLowerCase()) {
    case 'python':
    case 'py':
      return <PythonLogo size={size} />;
    case 'java':
      return <JavaLogo size={size} />;
    case 'cpp':
    case 'c++':
    case 'cplusplus':
      return <CppLogo size={size} />;
    case 'javascript':
    case 'js':
      return <JavaScriptLogo size={size} />;
    case 'c':
      return <CLogo size={size} />;
    case 'csharp':
    case 'c#':
    case 'cs':
      return <CSharpLogo size={size} />;
    case 'php':
      return <PhpLogo size={size} />;
    case 'sql':
      return <SqlLogo size={size} />;
    case 'html-css':
    case 'html':
    case 'css':
    case 'html_css':
      return <HtmlCssLogo size={size} />;
    case 'go':
    case 'golang':
      return <GoLogo size={size} />;
    case 'kotlin':
    case 'kt':
      return <KotlinLogo size={size} />;
    case 'typescript':
    case 'ts':
      return <TypeScriptLogo size={size} />;
    case 'dart':
      return <DartLogo size={size} />;
    case 'swift':
      return <SwiftLogo size={size} />;
    case 'r':
      return <RLogo size={size} />;
    default:
      return <PythonLogo size={size} />;
  }
};
