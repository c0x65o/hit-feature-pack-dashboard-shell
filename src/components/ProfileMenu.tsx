'use client';

import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import type { ShellUser } from '../types';

interface ProfileMenuProps {
  user: ShellUser | null;
  onClose: () => void;
  onLogout?: () => void;
  onNavigate?: (path: string) => void;
}

export function ProfileMenu({
  user,
  onClose,
  onLogout,
  onNavigate,
}: ProfileMenuProps) {
  const handleLogout = () => {
    onClose();
    if (onLogout) {
      onLogout();
    } else if (typeof window !== 'undefined') {
      // Default logout: clear token and redirect
      document.cookie = 'hit_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('hit_token');
      window.location.href = '/login';
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg shadow-xl z-50">
      <div className="p-3 border-b border-[var(--hit-border)]">
        <div className="font-medium text-[var(--hit-foreground)]">
          {user?.name || 'User'}
        </div>
        <div className="text-sm text-[var(--hit-muted-foreground)]">
          {user?.email || ''}
        </div>
      </div>
      <div className="py-2">
        <button
          onClick={() => handleNavigate('/profile')}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--hit-surface-hover)] transition-colors text-left text-[var(--hit-foreground)]"
        >
          <User size={16} />
          <span>Profile</span>
        </button>
        <button
          onClick={() => handleNavigate('/settings')}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--hit-surface-hover)] transition-colors text-left text-[var(--hit-foreground)]"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
      <div className="border-t border-[var(--hit-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--hit-surface-hover)] transition-colors text-left text-[var(--hit-error)]"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
