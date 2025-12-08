/**
 * Type definitions for the dashboard shell
 */

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  roles?: string[];
  showWhen?: 'authenticated' | 'unauthenticated' | 'always';
  children?: Omit<NavItem, 'children' | 'id'>[];
}

export interface ShellConfig {
  brandName: string;
  logoUrl: string;
  sidebarPosition: 'left' | 'right';
  showNotifications: boolean;
  showThemeToggle: boolean;
  showUserMenu: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
}

export interface ShellUser {
  email?: string;
  name?: string;
  roles?: string[];
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'payment' | 'hr' | 'error' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ShellState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  expandedNavItems: Set<string>;
  toggleNavItem: (id: string) => void;
  config: ShellConfig;
  user: ShellUser | null;
  navItems: NavItem[];
}
