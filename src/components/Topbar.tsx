'use client';

import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useShell } from '../hooks/useShell';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPanel } from './NotificationPanel';
import { ProfileMenu } from './ProfileMenu';
import type { Notification } from '../types';

interface TopbarProps {
  title?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
}

export function Topbar({
  title,
  onNavigate,
  onLogout,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onClearAllNotifications,
}: TopbarProps) {
  const { config, user, toggleSidebar } = useShell();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const closeMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return (
    <div className="h-16 bg-[var(--hit-surface)] border-b border-[var(--hit-border)] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[var(--hit-surface-hover)] rounded-lg transition-colors"
        >
          <Menu size={20} className="text-[var(--hit-foreground)]" />
        </button>
        {title && (
          <h1 className="text-xl font-semibold text-[var(--hit-foreground)]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {config.showThemeToggle && <ThemeToggle />}

        {/* Notifications */}
        {config.showNotifications && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 hover:bg-[var(--hit-surface-hover)] rounded-lg relative transition-colors"
            >
              <Bell size={20} className="text-[var(--hit-foreground)]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-[var(--hit-error)] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                onDelete={onDeleteNotification || (() => {})}
                onClearAll={onClearAllNotifications || (() => {})}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        )}

        {/* Profile Menu */}
        {config.showUserMenu && (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 hover:bg-[var(--hit-surface-hover)] rounded-lg transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-[var(--hit-foreground)]">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-[var(--hit-muted-foreground)]">
                  {user?.roles?.[0] || 'User'}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
            </button>

            {showProfileMenu && (
              <ProfileMenu
                user={user}
                onClose={() => setShowProfileMenu(false)}
                onLogout={onLogout}
                onNavigate={onNavigate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
