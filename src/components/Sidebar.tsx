'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useShell } from '../hooks/useShell';
import { NavTree } from './NavTree';

interface SidebarProps {
  activePath: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  const { config, navItems, sidebarOpen, setSidebarOpen } = useShell();

  return (
    <div
      className={`
        fixed top-0 h-full w-80 bg-[var(--hit-surface)] border-r border-[var(--hit-border)]
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${config.sidebarPosition === 'right' ? 'right-0 left-auto border-r-0 border-l' : 'left-0'}
        flex flex-col
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--hit-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.brandName}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {config.brandName.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-semibold text-lg text-[var(--hit-foreground)]">
            {config.brandName}
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 hover:bg-[var(--hit-surface-hover)] rounded-lg transition-colors"
        >
          <X size={20} className="text-[var(--hit-foreground)]" />
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <NavTree
          items={navItems}
          activePath={activePath}
          onNavigate={onNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--hit-border)] flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-[var(--hit-muted-foreground)]">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
