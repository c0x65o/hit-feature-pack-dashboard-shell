'use client';

import React from 'react';
import { ShellContext, useShellState } from '../hooks/useShell';
import { useNotifications } from '../hooks/useNotifications';
import { MobileMenu } from './MobileMenu';
import { Topbar } from './Topbar';
import type { ShellConfig, ShellUser, NavItem, Notification } from '../types';

interface DashboardShellProps {
  children: React.ReactNode;
  config?: Partial<ShellConfig>;
  navItems?: NavItem[];
  user?: ShellUser | null;
  activePath?: string;
  pageTitle?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  initialNotifications?: Notification[];
}

export function DashboardShell({
  children,
  config = {},
  navItems = [],
  user = null,
  activePath = '/',
  pageTitle,
  onNavigate,
  onLogout,
  initialNotifications = [],
}: DashboardShellProps) {
  const shellState = useShellState(config, navItems, user);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications(initialNotifications);

  return (
    <ShellContext.Provider value={shellState}>
      <div className="min-h-screen bg-[var(--hit-background)] text-[var(--hit-foreground)] flex">
        {/* Mobile Menu (includes sidebar) */}
        <MobileMenu activePath={activePath} onNavigate={onNavigate} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar
            title={pageTitle}
            onNavigate={onNavigate}
            onLogout={onLogout}
            notifications={notifications}
            onMarkNotificationAsRead={markAsRead}
            onMarkAllNotificationsAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onClearAllNotifications={clearAll}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

/**
 * Headless Shell Provider - for apps that want full control over layout
 * but still want shell state management
 */
export function ShellProvider({
  children,
  config = {},
  navItems = [],
  user = null,
}: Omit<DashboardShellProps, 'activePath' | 'pageTitle' | 'onNavigate' | 'onLogout' | 'initialNotifications'>) {
  const shellState = useShellState(config, navItems, user);

  return (
    <ShellContext.Provider value={shellState}>
      {children}
    </ShellContext.Provider>
  );
}
