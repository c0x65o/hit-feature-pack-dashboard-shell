'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  Check,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import type {
  UiKit,
  PageProps,
  CardProps,
  ButtonProps,
  InputProps,
  TextAreaProps,
  SelectProps,
  CheckboxProps,
  TableProps,
  BadgeProps,
  AlertProps,
  ModalProps,
  SpinnerProps,
  EmptyStateProps,
  TabsProps,
  DropdownProps,
  AvatarProps,
} from '@hit/ui-kit';

// =============================================================================
// HELPER - Class name utility
// =============================================================================

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// PAGE
// =============================================================================

function Page({ title, description, actions, children }: PageProps) {
  return (
    <div className="space-y-6">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>}
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// =============================================================================
// CARD
// =============================================================================

function Card({ title, description, footer, children }: CardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-800">
          {title && <h2 className="text-lg font-medium text-gray-100">{title}</h2>}
          {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800">{footer}</div>
      )}
    </div>
  );
}

// =============================================================================
// BUTTON
// =============================================================================

function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  type = 'button',
  onClick,
  children,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-800 text-gray-100 hover:bg-gray-700 focus:ring-gray-500 border border-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-400 hover:text-gray-100 hover:bg-gray-800 focus:ring-gray-500',
    link: 'text-blue-500 hover:text-blue-400 underline-offset-4 hover:underline',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
    >
      {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
      {children}
    </button>
  );
}

// =============================================================================
// INPUT
// =============================================================================

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required,
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-700'
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// =============================================================================
// TEXTAREA
// =============================================================================

function TextArea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  disabled,
  required,
}: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-700'
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// =============================================================================
// SELECT
// =============================================================================

function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required,
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-700'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// =============================================================================
// CHECKBOX
// =============================================================================

function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={cn(
            'w-5 h-5 border rounded flex items-center justify-center transition-colors',
            'peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-focus:ring-offset-gray-950',
            checked ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}

// =============================================================================
// TABLE
// =============================================================================

function Table({ columns, data, onRowClick, emptyMessage, loading }: TableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {emptyMessage || 'No data available'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gray-800/50'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-sm text-gray-300',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render
                    ? col.render(row[col.key], row, rowIndex)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// BADGE
// =============================================================================

function Badge({ variant = 'default', children }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-green-900/50 text-green-400 border border-green-800',
    warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
    error: 'bg-red-900/50 text-red-400 border border-red-800',
    info: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {children}
    </span>
  );
}

// =============================================================================
// AVATAR
// =============================================================================

function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden',
        sizeStyles[size]
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-medium">{initials || '?'}</span>
      )}
    </div>
  );
}

// =============================================================================
// ALERT
// =============================================================================

function Alert({ variant, title, onClose, children }: AlertProps) {
  const variantStyles = {
    success: {
      bg: 'bg-green-900/20 border-green-800',
      icon: <CheckCircle size={20} className="text-green-500" />,
      title: 'text-green-400',
    },
    warning: {
      bg: 'bg-yellow-900/20 border-yellow-800',
      icon: <AlertTriangle size={20} className="text-yellow-500" />,
      title: 'text-yellow-400',
    },
    error: {
      bg: 'bg-red-900/20 border-red-800',
      icon: <AlertCircle size={20} className="text-red-500" />,
      title: 'text-red-400',
    },
    info: {
      bg: 'bg-blue-900/20 border-blue-800',
      icon: <Info size={20} className="text-blue-500" />,
      title: 'text-blue-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('border rounded-lg p-4', styles.bg)}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="flex-1">
          {title && <h3 className={cn('font-medium', styles.title)}>{title}</h3>}
          <div className="text-sm text-gray-300 mt-1">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MODAL
// =============================================================================

function Modal({ open, onClose, title, description, size = 'md', children }: ModalProps) {
  if (!open) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />

        {/* Modal */}
        <div
          className={cn(
            'relative w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl',
            sizeStyles[size]
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                {title && <h2 className="text-lg font-semibold text-gray-100">{title}</h2>}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SPINNER
// =============================================================================

function Spinner({ size = 'md' }: SpinnerProps) {
  const sizeStyles = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return <Loader2 size={sizeStyles[size]} className="animate-spin text-blue-500" />;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4 text-gray-500">
        {icon || <FileQuestion size={48} />}
      </div>
      <h3 className="text-lg font-medium text-gray-100">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =============================================================================
// TABS
// =============================================================================

function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const [localActive, setLocalActive] = useState(activeTab || tabs[0]?.id);
  const currentTab = activeTab ?? localActive;

  const handleChange = (tabId: string) => {
    setLocalActive(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      <div className="border-b border-gray-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className={cn(
                'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{tabs.find((t) => t.id === currentTab)?.content}</div>
    </div>
  );
}

// =============================================================================
// DROPDOWN
// =============================================================================

function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-50 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                    'hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
                    item.danger ? 'text-red-400' : 'text-gray-300'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// EXPORT ERP KIT
// =============================================================================

/**
 * ERP-style UI Kit implementation.
 * Dark theme, dense layout, admin-focused design.
 */
export const erpKit: UiKit = {
  Page,
  Card,
  Button,
  Input,
  TextArea,
  Select,
  Checkbox,
  Table,
  Badge,
  Avatar,
  Alert,
  Modal,
  Spinner,
  EmptyState,
  Tabs,
  Dropdown,
};
