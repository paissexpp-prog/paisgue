import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // State untuk Mode (Light/Dark/System)
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'system');
  
  // State untuk Warna Aksen (Blue/Violet/Emerald)
  const [accent, setAccent] = useState(localStorage.getItem('themeAccent') || 'blue');

  // Logika Penerapan Dark/Light Mode
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('themeMode', mode);

    const applyTheme = (theme) => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
      
      // Listener jika user ganti settingan OS
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(mode);
    }
  }, [mode]);

  // Simpan Warna Aksen
  useEffect(() => {
    localStorage.setItem('themeAccent', accent);
  }, [accent]);

  // Helper untuk mengambil class warna berdasarkan aksen yang dipilih
  const getAccentClasses = () => {
    switch (accent) {
      case 'violet':
        return {
          btn: 'bg-violet-600 hover:bg-violet-700 text-white',
          text: 'text-violet-600 dark:text-violet-400',
          bg: 'bg-violet-50 dark:bg-violet-900/20',
          border: 'border-violet-200 dark:border-violet-800',
          ring: 'focus:ring-violet-500',
          gradient: 'from-violet-600 to-purple-600'
        };
      case 'emerald':
        return {
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800',
          ring: 'focus:ring-emerald-500',
          gradient: 'from-emerald-600 to-teal-600'
        };
      default: // Blue
        return {
          btn: 'bg-blue-600 hover:bg-blue-700 text-white',
          text: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          ring: 'focus:ring-blue-500',
          gradient: 'from-blue-600 to-cyan-600'
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent, color: getAccentClasses() }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

