import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default warna 'blue', opsi: 'blue', 'violet', 'emerald'
  const [colorTheme, setColorTheme] = useState(localStorage.getItem('theme') || 'blue');

  useEffect(() => {
    localStorage.setItem('theme', colorTheme);
  }, [colorTheme]);

  // Kita sediakan peta warna agar Tailwind bisa membacanya
  const getThemeClasses = () => {
    switch (colorTheme) {
      case 'violet':
        return {
          primary: 'bg-violet-600 hover:bg-violet-700',
          text: 'text-violet-400',
          border: 'border-violet-500',
          ring: 'focus:ring-violet-500',
          gradient: 'from-violet-600 to-fuchsia-600'
        };
      case 'emerald':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700',
          text: 'text-emerald-400',
          border: 'border-emerald-500',
          ring: 'focus:ring-emerald-500',
          gradient: 'from-emerald-600 to-teal-600'
        };
      default: // Blue
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          text: 'text-blue-400',
          border: 'border-blue-500',
          ring: 'focus:ring-blue-500',
          gradient: 'from-blue-600 to-cyan-600'
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme, theme: getThemeClasses() }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
