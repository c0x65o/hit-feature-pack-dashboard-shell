/**
 * Navigation item structure for sidebar tree
 */
export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  roles?: string[];
  showWhen?: 'authenticated' | 'unauthenticated' | 'always';
  children?: Omit<NavItem, 'children'>[];
}

/**
 * Shell configuration options
 */
export interface ShellConfig {
  brandName: string;
  logoUrl?: string;
  sidebarPosition: 'left' | 'right';
  showNotifications: boolean;
  showThemeToggle: boolean;
  showUserMenu: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
}

/**
 * User information for profile menu
 */
export interface ShellUser {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  roles?: string[];
}

/**
 * Notification item
 */
export interface Notification {
  id: string | number;
  type?: 'order' | 'inventory' | 'payment' | 'hr' | 'error' | 'system' | string;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Shell state (internal)
 */
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
