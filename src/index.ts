// Main exports
export { DashboardShell, ShellProvider } from './components/DashboardShell';

// Component exports
export {
  Sidebar,
  Topbar,
  MobileMenu,
  NavTree,
  NotificationPanel,
  ProfileMenu,
  ThemeToggle,
} from './components';

// Hook exports
export {
  useShell,
  useShellState,
  ShellContext,
  useNotifications,
} from './hooks';

// Type exports
export type {
  NavItem,
  ShellConfig,
  ShellUser,
  Notification,
  ShellState,
} from './types';
