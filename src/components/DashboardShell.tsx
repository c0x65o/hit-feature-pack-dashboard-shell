'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  Trash2,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  XCircle,
  Info,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { UiKitProvider } from '@hit/ui-kit';
import { erpKit } from '../kit';
import type { NavItem, ShellUser, Notification, ShellConfig } from '../types';

// =============================================================================
// CONTEXT
// =============================================================================

interface ShellContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  config: ShellConfig;
  user: ShellUser | null;
}

const ShellContext = createContext<ShellContextType | null>(null);

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) throw new Error('useShell must be used within DashboardShell');
  return context;
}

// =============================================================================
// TREE NODE COMPONENT
// =============================================================================

interface TreeNodeProps {
  node: NavItem;
  level?: number;
  activePath: string;
  onNavigate?: (path: string) => void;
}

function TreeNode({ node, level = 0, activePath, onNavigate }: TreeNodeProps) {
  const { isDarkMode, expandedNodes, toggleNode, setMenuOpen } = useShell();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isActive = activePath === node.path;

  // Get icon component
  const iconName = node.icon 
    ? node.icon.charAt(0).toUpperCase() + node.icon.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    : '';
  const IconComponent = node.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName]
    : null;

  const handleClick = () => {
    if (hasChildren) {
      toggleNode(node.id);
    } else if (node.path) {
      if (onNavigate) {
        onNavigate(node.path);
      } else if (typeof window !== 'undefined') {
        window.location.href = node.path;
      }
      setMenuOpen(false);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${level === 0 ? 'font-medium' : 'text-sm'}
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : isDarkMode 
              ? 'text-gray-300 hover:bg-gray-800' 
              : 'text-gray-700 hover:bg-gray-100'
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
            <TreeNode
              key={`${node.id}-${idx}`}
              node={{ ...child, id: `${node.id}-${idx}` } as NavItem}
              level={level + 1}
              activePath={activePath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// NOTIFICATION HELPERS
// =============================================================================

function getNotificationIcon(type: string) {
  switch (type) {
    case 'order': return <ShoppingCart size={18} className="text-blue-500" />;
    case 'inventory': return <Package size={18} className="text-orange-500" />;
    case 'payment': return <DollarSign size={18} className="text-green-500" />;
    case 'hr': return <Users size={18} className="text-purple-500" />;
    case 'error': return <XCircle size={18} className="text-red-500" />;
    case 'system': return <Info size={18} className="text-blue-400" />;
    default: return <Bell size={18} className="text-gray-400" />;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'border-l-red-500';
    case 'medium': return 'border-l-orange-500';
    case 'low': return 'border-l-blue-500';
    default: return 'border-l-gray-500';
  }
}

function formatTimestamp(timestamp: Date | string) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
  config: configProp = {},
  navItems = [],
  user = null,
  activePath = '/',
  pageTitle,
  onNavigate,
  onLogout,
  initialNotifications = [],
}: DashboardShellProps) {
  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Config
  const config: ShellConfig = {
    brandName: configProp.brandName || 'HIT',
    logoUrl: configProp.logoUrl || '/icon.png',
    sidebarPosition: configProp.sidebarPosition || 'left',
    showNotifications: configProp.showNotifications ?? true,
    showThemeToggle: configProp.showThemeToggle ?? true,
    showUserMenu: configProp.showUserMenu ?? true,
    defaultTheme: configProp.defaultTheme || 'system',
  };

  // Initialize theme
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('hit-theme');
    if (stored === 'light' || stored === 'dark') {
      setIsDarkMode(stored === 'dark');
      return;
    }

    if (config.defaultTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    } else {
      setIsDarkMode(config.defaultTheme === 'dark');
    }
  }, [config.defaultTheme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('hit-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const markAsRead = (id: string | number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Theme classes
  const bgPrimary = isDarkMode ? 'bg-gray-950' : 'bg-gray-50';
  const bgSecondary = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  // Context value
  const contextValue: ShellContextType = {
    isDarkMode,
    toggleTheme,
    menuOpen,
    setMenuOpen,
    expandedNodes,
    toggleNode,
    config,
    user,
  };

  return (
    <ShellContext.Provider value={contextValue}>
      <div className={`flex h-screen ${bgPrimary} ${textPrimary}`}>
        {/* Hamburger Menu Overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Hamburger Menu / Sidebar */}
        <div
          className={`
            fixed top-0 left-0 h-full w-80 ${bgSecondary} border-r ${borderColor}
            transform transition-transform duration-300 ease-in-out z-50
            ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col
          `}
        >
          {/* Menu Header */}
          <div className={`h-16 flex items-center justify-between px-4 border-b ${borderColor} flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt={config.brandName}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-sm">{config.brandName.charAt(0)}</span>
                )}
              </div>
              <span className="font-semibold text-lg">{config.brandName}</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className={`p-2 ${hoverBg} rounded-lg transition-colors`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tree */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            {navItems.map((item) => (
              <TreeNode
                key={item.id}
                node={item}
                activePath={activePath}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Menu Footer */}
          <div className={`p-4 border-t ${borderColor} flex-shrink-0`}>
            <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className={`h-16 ${bgSecondary} border-b ${borderColor} flex items-center justify-between px-6 flex-shrink-0`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(true)}
                className={`p-2 ${hoverBg} rounded-lg transition-colors`}
              >
                <Menu size={20} />
              </button>
              {pageTitle && <h1 className="text-xl font-semibold">{pageTitle}</h1>}
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              {config.showThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className={`p-2 ${hoverBg} rounded-lg transition-colors`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              {/* Notifications */}
              {config.showNotifications && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className={`p-2 ${hoverBg} rounded-lg relative transition-colors`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Panel */}
                  {showNotifications && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className={`absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] ${bgSecondary} border ${borderColor} rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col`}>
                        {/* Header */}
                        <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
                          <div>
                            <h3 className="font-semibold text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                              <p className={`text-xs ${textSecondary}`}>{unreadCount} unread</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className={`${textSecondary} hover:text-blue-500 transition-colors`}
                                title="Mark all as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className={`${textSecondary} hover:text-red-500 transition-colors`}
                                title="Clear all"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={48} className={`mx-auto ${textSecondary} mb-3`} />
                              <p className={textSecondary}>No notifications</p>
                            </div>
                          ) : (
                            <div className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`
                                    p-4 border-l-4 ${getPriorityColor(notification.priority || 'low')}
                                    ${!notification.read ? (isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50/50') : ''}
                                    ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                                    transition-colors cursor-pointer
                                  `}
                                  onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {getNotificationIcon(notification.type || 'system')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                          {notification.title}
                                        </h4>
                                        {!notification.read && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                      </div>
                                      <p className={`text-sm ${textSecondary} mb-2 line-clamp-2`}>
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <span className={`text-xs ${textSecondary}`}>
                                          {formatTimestamp(notification.timestamp)}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                          }}
                                          className={`text-xs ${textSecondary} hover:text-red-500 transition-colors`}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className={`p-3 border-t ${borderColor} text-center`}>
                            <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
                              View All Notifications
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Profile */}
              {config.showUserMenu && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className={`flex items-center gap-3 p-2 ${hoverBg} rounded-lg transition-colors`}
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium">{user?.name || user?.email || 'User'}</div>
                      <div className={`text-xs ${textSecondary}`}>
                        {user?.roles?.[0] || 'Member'}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className={`absolute right-0 mt-2 w-56 ${bgSecondary} border ${borderColor} rounded-lg shadow-xl z-50`}>
                        <div className={`p-3 border-b ${borderColor}`}>
                          <div className="font-medium">{user?.name || 'User'}</div>
                          <div className={`text-sm ${textSecondary}`}>{user?.email || ''}</div>
                        </div>
                        <div className="py-2">
                          <button className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left`}>
                            <User size={16} />
                            <span>Profile</span>
                          </button>
                          <button className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left`}>
                            <Settings size={16} />
                            <span>Settings</span>
                          </button>
                        </div>
                        <div className={`border-t ${borderColor}`}>
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              onLogout?.();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left text-red-400`}
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div
            className="flex-1 overflow-auto p-6"
            onClick={() => {
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          >
            <div className="max-w-7xl mx-auto">
              <UiKitProvider kit={erpKit}>
                {children}
              </UiKitProvider>
            </div>
          </div>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export default DashboardShell;
