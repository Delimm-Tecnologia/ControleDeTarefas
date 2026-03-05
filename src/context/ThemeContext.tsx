import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = {
  name: string;
  value: string;
};

interface ThemeContextType {
  primaryColor: ThemeColor;
  setPrimaryColor: (color: ThemeColor) => void;
}

const COLORS: ThemeColor[] = [
  { name: 'Azul', value: '#5048e5' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Preto', value: '#0f172a' },
  { name: 'Vermelho', value: '#ef4444' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('delimm-primary-color');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return COLORS[0];
      }
    }
    return COLORS[0];
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color-primary', primaryColor.value);
    localStorage.setItem('delimm-primary-color', JSON.stringify(primaryColor));
  }, [primaryColor]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { COLORS };
