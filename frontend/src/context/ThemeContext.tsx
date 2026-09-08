import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'study';

export interface ThemeOption {
  id: Theme;
  name: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeBg: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Obsidian Black',
    subtitle: 'AMOLED Jet Black & Neon Focus',
    icon: 'Moon',
    badge: 'True Black',
    badgeBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'light',
    name: 'Crisp White',
    subtitle: 'Clean Slate & Pure High Contrast',
    icon: 'Sun',
    badge: 'Classic Light',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'study',
    name: 'Warm Study Mode',
    subtitle: 'Parchment Sepia & Eye-Care Calm',
    icon: 'BookOpen',
    badge: 'Eye Care',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'study') return saved as Theme;
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Reset theme classes
    root.classList.remove('dark', 'study', 'light');
    body.classList.remove('dark', 'study', 'light');

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'study') {
      root.classList.add('study');
      body.classList.add('study');
      root.setAttribute('data-theme', 'study');
    } else {
      root.classList.add('light');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'study';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
