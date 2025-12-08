'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useShell } from '../hooks/useShell';
import type { NavItem } from '../types';

interface NavTreeNodeProps {
  node: NavItem;
  level?: number;
  activePath: string;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

function NavTreeNode({
  node,
  level = 0,
  activePath,
  onNavigate,
  onClose,
}: NavTreeNodeProps) {
  const { expandedNavItems, toggleNavItem } = useShell();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNavItems.has(node.id);
  const isActive = activePath === node.path;

  // Get icon component from lucide-react
  const IconComponent = node.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
        node.icon.charAt(0).toUpperCase() + node.icon.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      ] || null
    : null;

  const handleClick = () => {
    if (hasChildren) {
      toggleNavItem(node.id);
    } else if (node.path) {
      if (onNavigate) {
        onNavigate(node.path);
      } else if (typeof window !== 'undefined') {
        window.location.href = node.path;
      }
      onClose?.();
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${level === 0 ? 'font-medium' : 'text-sm'}
          ${
            isActive
              ? 'bg-[var(--hit-primary)] text-white'
              : 'text-[var(--hit-foreground)] hover:bg-[var(--hit-surface-hover)]'
          }
        `}
        style={{ marginLeft: level > 0 ? `${level * 16}px` : '0' }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        {IconComponent && <IconComponent size={18} className="flex-shrink-0" />}
        <span className="flex-1 truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map((child, idx) => (
            <NavTreeNode
              key={`${node.id}-child-${idx}`}
              node={{ ...child, id: `${node.id}-child-${idx}` }}
              level={level + 1}
              activePath={activePath}
              onNavigate={onNavigate}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NavTreeProps {
  items: NavItem[];
  activePath: string;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

export function NavTree({ items, activePath, onNavigate, onClose }: NavTreeProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavTreeNode
          key={item.id}
          node={item}
          activePath={activePath}
          onNavigate={onNavigate}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
