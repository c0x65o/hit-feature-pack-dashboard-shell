'use client';

import React from 'react';
import {
  Bell,
  X,
  Check,
  Trash2,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  XCircle,
  Info,
} from 'lucide-react';
import type { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onClose,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'order':
        return <ShoppingCart {...iconProps} className="text-blue-500" />;
      case 'inventory':
        return <Package {...iconProps} className="text-orange-500" />;
      case 'payment':
        return <DollarSign {...iconProps} className="text-green-500" />;
      case 'hr':
        return <Users {...iconProps} className="text-purple-500" />;
      case 'error':
        return <XCircle {...iconProps} className="text-red-500" />;
      case 'system':
      case 'info':
      default:
        return <Info {...iconProps} className="text-[var(--hit-info)]" />;
    }
  };

  const getPriorityBorderClass = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-[var(--hit-border)]';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        onClick={onClose}
      />

      <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--hit-border)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-[var(--hit-foreground)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-[var(--hit-muted-foreground)]">
                {unreadCount} unread
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[var(--hit-muted-foreground)] hover:text-[var(--hit-primary)] transition-colors"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[var(--hit-muted-foreground)] hover:text-[var(--hit-error)] transition-colors"
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
              <Bell
                size={48}
                className="mx-auto text-[var(--hit-muted-foreground)] mb-3"
              />
              <p className="text-[var(--hit-muted-foreground)]">
                No notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--hit-border)]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 border-l-4 ${getPriorityBorderClass(notification.priority)}
                    ${!notification.read ? 'bg-[var(--hit-primary-light)]' : ''}
                    hover:bg-[var(--hit-surface-hover)]
                    transition-colors cursor-pointer
                  `}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`font-medium text-sm text-[var(--hit-foreground)] ${
                            !notification.read ? 'font-semibold' : ''
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[var(--hit-primary)] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--hit-muted-foreground)] mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--hit-muted-foreground)]">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          className="text-[var(--hit-muted-foreground)] hover:text-[var(--hit-error)] transition-colors"
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
          <div className="p-3 border-t border-[var(--hit-border)] text-center">
            <button className="text-sm text-[var(--hit-primary)] hover:text-[var(--hit-primary-hover)] font-medium transition-colors">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}
