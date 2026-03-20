import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  dark: {
    name: 'dark',
    label: 'Dark',
    '--bg':        '#080808',
    '--surface':   '#111111',
    '--surface2':  '#1a1a1a',
    '--border':    '#222222',
    '--border2':   '#2e2e2e',
    '--text':      '#f0ede8',
    '--muted':     '#666666',
    '--muted2':    '#444444',
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    '--bg':        '#020817',
    '--surface':   '#0f172a',
    '--surface2':  '#1e293b',
    '--border':    '#1e293b',
    '--border2':   '#334155',
    '--text':      '#e2e8f0',
    '--muted':     '#64748b',
    '--muted2':    '#334155',
  },
  light: {
    name: 'light',
    label: 'Light',
    '--bg':        '#fafaf9',
    '--surface':   '#ffffff',
    '--surface2':  '#f5f5f4',
    '--border':    '#e7e5e4',
    '--border2':   '#d6d3d1',
    '--text':      '#1c1917',
    '--muted':     '#78716c',
    '--muted2':    '#a8a29e',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('a1d-theme');
      if (saved && THEMES[saved]) setTheme(saved);
    } catch {}
  }, []);

  const applyTheme = (name) => {
    const t = THEMES[name] || THEMES.dark;
    setTheme(name);
    try { localStorage.setItem('a1d-theme', name); } catch {}
    Object.entries(t).forEach(([k, v]) => {
      if (k.startsWith('--')) document.documentElement.style.setProperty(k, v);
    });
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, applyTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
