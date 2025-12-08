'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ShellConfig, ShellState, ShellUser, NavItem } from '../types';

const defaultConfig: ShellConfig = {
  brandName: 'HIT',
  logoUrl: '/icon.png',
  sidebarPosition: 'left',
  showNotifications: true,
  showThemeToggle: true,
  showUserMenu: true,
  defaultTheme: 'system',
};

export const ShellContext = createContext<ShellState | null>(null);

export function useShell(): ShellState {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}

export function useShellState(
  config: Partial<ShellConfig> = {},
  navItems: NavItem[] = [],
  user: ShellUser | null = null
): ShellState {
  const mergedConfig = { ...defaultConfig, ...config };
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(new Set());
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  // Initialize theme from system preference or stored value
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('hit-theme');
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
      return;
    }

    if (mergedConfig.defaultTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    } else if (mergedConfig.defaultTheme === 'light' || mergedConfig.defaultTheme === 'dark') {
      setThemeState(mergedConfig.defaultTheme);
    }
  }, [mergedConfig.defaultTheme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hit-theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const toggleNavItem = useCallback((id: string) => {
    setExpandedNavItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    theme,
    setTheme,
    toggleTheme,
    expandedNavItems,
    toggleNavItem,
    config: mergedConfig,
    user,
    navItems,
  };
}
