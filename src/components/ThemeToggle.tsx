'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useShell } from '../hooks/useShell';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useShell();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-[var(--hit-surface-hover)] ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-[var(--hit-foreground)]" />
      ) : (
        <Moon size={20} className="text-[var(--hit-foreground)]" />
      )}
    </button>
  );
}
