import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ilahi-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ilahi-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-amber-100/70 dark:bg-stone-800 text-stone-800 dark:text-amber-300 hover:bg-amber-200/70 dark:hover:bg-stone-700 transition-colors border border-amber-200/60 dark:border-stone-700"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-700" />}
    </button>
  );
};
