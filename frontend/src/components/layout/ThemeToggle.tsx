import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (compact) {
    return (
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Toggle theme"
        className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-surface-2 text-text border border-border/60 transition-transform active:scale-95"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />}
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}

