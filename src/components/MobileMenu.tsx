'use client';

import React from 'react';
import { useShell } from '../hooks/useShell';
import { Sidebar } from './Sidebar';

interface MobileMenuProps {
  activePath: string;
  onNavigate?: (path: string) => void;
}

export function MobileMenu({ activePath, onNavigate }: MobileMenuProps) {
  const { sidebarOpen, setSidebarOpen } = useShell();

  return (
    <>
      {/* Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar activePath={activePath} onNavigate={onNavigate} />
    </>
  );
}
