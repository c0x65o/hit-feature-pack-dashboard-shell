'use client';

import React from 'react';
import { X, Loader2, AlertCircle, CheckCircle, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import type { UiKit } from '@hit/ui-kit';

// =============================================================================
// ERP KIT - Dark, dense, admin-style components
// =============================================================================

// Helper for class names
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
const Page: UiKit['Page'] = ({ title, description, actions, children }) => {
  return React.createElement('div', { className: 'space-y-6' },
    (title || actions) && React.createElement('div', { className: 'flex items-start justify-between gap-4' },
      React.createElement('div', null,
        title && React.createElement('h1', { className: 'text-2xl font-semibold text-gray-100' }, title),
        description && React.createElement('p', { className: 'text-gray-400 mt-1' }, description)
      ),
      actions && React.createElement('div', { className: 'flex-shrink-0' }, actions)
    ),
    children
  );
};

// -----------------------------------------------------------------------------
// Card
// -----------------------------------------------------------------------------
const Card: UiKit['Card'] = ({ title, description, footer, children }) => {
  return React.createElement('div', { className: 'bg-gray-900 border border-gray-800 rounded-lg overflow-hidden' },
    (title || description) && React.createElement('div', { className: 'px-6 py-4 border-b border-gray-800' },
      title && React.createElement('h2', { className: 'text-lg font-medium text-gray-100' }, title),
      description && React.createElement('p', { className: 'text-sm text-gray-400 mt-1' }, description)
    ),
    React.createElement('div', { className: 'p-6' }, children),
    footer && React.createElement('div', { className: 'px-6 py-4 border-t border-gray-800 bg-gray-900/50' }, footer)
  );
};

// -----------------------------------------------------------------------------
// Button
// -----------------------------------------------------------------------------
const Button: UiKit['Button'] = ({ variant = 'primary', size = 'md', loading, disabled, type = 'button', onClick, children }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
    link: 'text-blue-500 hover:text-blue-400 underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return React.createElement('button', {
    type,
    onClick,
    disabled: disabled || loading,
    className: cn(baseClasses, variantClasses[variant], sizeClasses[size]),
  },
    loading && React.createElement(Loader2, { size: size === 'sm' ? 14 : 16, className: 'animate-spin' }),
    children
  );
};

// -----------------------------------------------------------------------------
// Input
// -----------------------------------------------------------------------------
const Input: UiKit['Input'] = ({ label, type = 'text', placeholder, value, onChange, error, disabled, required }) => {
  return React.createElement('div', { className: 'space-y-1.5' },
    label && React.createElement('label', { className: 'block text-sm font-medium text-gray-200' },
      label,
      required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
    ),
    React.createElement('input', {
      type,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      placeholder,
      disabled,
      className: cn(
        'w-full px-3 py-2 rounded-lg border bg-gray-800 text-gray-100 placeholder-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error ? 'border-red-500' : 'border-gray-700'
      ),
    }),
    error && React.createElement('p', { className: 'text-sm text-red-500' }, error)
  );
};

// -----------------------------------------------------------------------------
// TextArea
// -----------------------------------------------------------------------------
const TextArea: UiKit['TextArea'] = ({ label, placeholder, value, onChange, rows = 4, error, disabled, required }) => {
  return React.createElement('div', { className: 'space-y-1.5' },
    label && React.createElement('label', { className: 'block text-sm font-medium text-gray-200' },
      label,
      required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
    ),
    React.createElement('textarea', {
      value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
      placeholder,
      rows,
      disabled,
      className: cn(
        'w-full px-3 py-2 rounded-lg border bg-gray-800 text-gray-100 placeholder-gray-500 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error ? 'border-red-500' : 'border-gray-700'
      ),
    }),
    error && React.createElement('p', { className: 'text-sm text-red-500' }, error)
  );
};

// -----------------------------------------------------------------------------
// Select
// -----------------------------------------------------------------------------
const Select: UiKit['Select'] = ({ label, options, value, onChange, placeholder, error, disabled, required }) => {
  return React.createElement('div', { className: 'space-y-1.5' },
    label && React.createElement('label', { className: 'block text-sm font-medium text-gray-200' },
      label,
      required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
    ),
    React.createElement('div', { className: 'relative' },
      React.createElement('select', {
        value,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
        disabled,
        className: cn(
          'w-full px-3 py-2 rounded-lg border bg-gray-800 text-gray-100 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-700'
        ),
      },
        placeholder && React.createElement('option', { value: '', disabled: true }, placeholder),
        options.map((opt) => 
          React.createElement('option', { key: opt.value, value: opt.value, disabled: opt.disabled }, opt.label)
        )
      ),
      React.createElement('div', { className: 'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400' },
        React.createElement(ChevronDown, { size: 16 })
      )
    ),
    error && React.createElement('p', { className: 'text-sm text-red-500' }, error)
  );
};

// -----------------------------------------------------------------------------
// Checkbox
// -----------------------------------------------------------------------------
const Checkbox: UiKit['Checkbox'] = ({ label, checked, onChange, disabled }) => {
  return React.createElement('label', {
    className: cn(
      'flex items-center gap-3 cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed'
    ),
  },
    React.createElement('input', {
      type: 'checkbox',
      checked,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
      disabled,
      className: 'w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900',
    }),
    label && React.createElement('span', { className: 'text-sm text-gray-200' }, label)
  );
};

// -----------------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------------
const Table: UiKit['Table'] = ({ columns, data, onRowClick, emptyMessage = 'No data', loading }) => {
  if (loading) {
    return React.createElement('div', { className: 'flex justify-center py-12' },
      React.createElement(Loader2, { size: 32, className: 'animate-spin text-gray-400' })
    );
  }

  if (!data.length) {
    return React.createElement('div', { className: 'text-center py-12 text-gray-400' }, emptyMessage);
  }

  return React.createElement('div', { className: 'overflow-x-auto' },
    React.createElement('table', { className: 'w-full' },
      React.createElement('thead', null,
        React.createElement('tr', { className: 'border-b border-gray-800' },
          columns.map((col) =>
            React.createElement('th', {
              key: col.key,
              className: cn(
                'px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider',
                col.align === 'center' && 'text-center',
                col.align === 'right' && 'text-right'
              ),
              style: col.width ? { width: col.width } : undefined,
            }, col.label)
          )
        )
      ),
      React.createElement('tbody', { className: 'divide-y divide-gray-800' },
        data.map((row, rowIndex) =>
          React.createElement('tr', {
            key: rowIndex,
            onClick: onRowClick ? () => onRowClick(row, rowIndex) : undefined,
            className: cn(
              'transition-colors',
              onRowClick && 'cursor-pointer hover:bg-gray-800/50'
            ),
          },
            columns.map((col) =>
              React.createElement('td', {
                key: col.key,
                className: cn(
                  'px-4 py-3 text-sm text-gray-200',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                ),
              },
                col.render ? col.render(row[col.key], row, rowIndex) : String(row[col.key] ?? '')
              )
            )
          )
        )
      )
    )
  );
};

// -----------------------------------------------------------------------------
// Badge
// -----------------------------------------------------------------------------
const Badge: UiKit['Badge'] = ({ variant = 'default', children }) => {
  const variantClasses = {
    default: 'bg-gray-700 text-gray-200',
    success: 'bg-green-900/50 text-green-400 border-green-800',
    warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    error: 'bg-red-900/50 text-red-400 border-red-800',
    info: 'bg-blue-900/50 text-blue-400 border-blue-800',
  };

  return React.createElement('span', {
    className: cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      variantClasses[variant]
    ),
  }, children);
};

// -----------------------------------------------------------------------------
// Avatar
// -----------------------------------------------------------------------------
const Avatar: UiKit['Avatar'] = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return React.createElement('img', {
      src,
      alt: name || 'Avatar',
      className: cn('rounded-full object-cover', sizeClasses[size]),
    });
  }

  return React.createElement('div', {
    className: cn(
      'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium',
      sizeClasses[size]
    ),
  }, initials || '?');
};

// -----------------------------------------------------------------------------
// Alert
// -----------------------------------------------------------------------------
const Alert: UiKit['Alert'] = ({ variant, title, onClose, children }) => {
  const variantConfig = {
    success: { bg: 'bg-green-900/30', border: 'border-green-800', text: 'text-green-400', Icon: CheckCircle },
    warning: { bg: 'bg-yellow-900/30', border: 'border-yellow-800', text: 'text-yellow-400', Icon: AlertTriangle },
    error: { bg: 'bg-red-900/30', border: 'border-red-800', text: 'text-red-400', Icon: AlertCircle },
    info: { bg: 'bg-blue-900/30', border: 'border-blue-800', text: 'text-blue-400', Icon: Info },
  };

  const config = variantConfig[variant];

  return React.createElement('div', {
    className: cn('rounded-lg border p-4', config.bg, config.border),
  },
    React.createElement('div', { className: 'flex gap-3' },
      React.createElement(config.Icon, { size: 20, className: config.text }),
      React.createElement('div', { className: 'flex-1' },
        title && React.createElement('h3', { className: cn('font-medium mb-1', config.text) }, title),
        React.createElement('div', { className: 'text-sm text-gray-300' }, children)
      ),
      onClose && React.createElement('button', {
        onClick: onClose,
        className: 'text-gray-400 hover:text-gray-200 transition-colors',
      },
        React.createElement(X, { size: 16 })
      )
    )
  );
};

// -----------------------------------------------------------------------------
// Modal
// -----------------------------------------------------------------------------
const Modal: UiKit['Modal'] = ({ open, onClose, title, description, size = 'md', children }) => {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center' },
    // Backdrop
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/60',
      onClick: onClose,
    }),
    // Content
    React.createElement('div', {
      className: cn(
        'relative w-full mx-4 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl',
        sizeClasses[size]
      ),
    },
      // Header
      (title || description) && React.createElement('div', { className: 'px-6 py-4 border-b border-gray-800' },
        React.createElement('div', { className: 'flex items-start justify-between gap-4' },
          React.createElement('div', null,
            title && React.createElement('h2', { className: 'text-lg font-semibold text-gray-100' }, title),
            description && React.createElement('p', { className: 'text-sm text-gray-400 mt-1' }, description)
          ),
          React.createElement('button', {
            onClick: onClose,
            className: 'text-gray-400 hover:text-gray-200 transition-colors',
          },
            React.createElement(X, { size: 20 })
          )
        )
      ),
      // Body
      React.createElement('div', { className: 'px-6 py-4' }, children)
    )
  );
};

// -----------------------------------------------------------------------------
// Spinner
// -----------------------------------------------------------------------------
const Spinner: UiKit['Spinner'] = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return React.createElement(Loader2, {
    size: sizeClasses[size],
    className: 'animate-spin text-blue-500',
  });
};

// -----------------------------------------------------------------------------
// EmptyState
// -----------------------------------------------------------------------------
const EmptyState: UiKit['EmptyState'] = ({ icon, title, description, action }) => {
  return React.createElement('div', { className: 'text-center py-12' },
    icon && React.createElement('div', { className: 'flex justify-center mb-4 text-gray-500' }, icon),
    React.createElement('h3', { className: 'text-lg font-medium text-gray-200 mb-2' }, title),
    description && React.createElement('p', { className: 'text-gray-400 mb-6 max-w-md mx-auto' }, description),
    action
  );
};

// -----------------------------------------------------------------------------
// Tabs
// -----------------------------------------------------------------------------
const Tabs: UiKit['Tabs'] = ({ tabs, activeTab, onChange }) => {
  const currentTab = activeTab || tabs[0]?.id;

  return React.createElement('div', null,
    // Tab headers
    React.createElement('div', { className: 'flex gap-1 border-b border-gray-800' },
      tabs.map((tab) =>
        React.createElement('button', {
          key: tab.id,
          onClick: () => onChange?.(tab.id),
          className: cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            currentTab === tab.id
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-gray-200'
          ),
        },
          tab.label,
          currentTab === tab.id && React.createElement('div', {
            className: 'absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500',
          })
        )
      )
    ),
    // Tab content
    React.createElement('div', { className: 'py-4' },
      tabs.find((tab) => tab.id === currentTab)?.content
    )
  );
};

// -----------------------------------------------------------------------------
// Dropdown
// -----------------------------------------------------------------------------
const Dropdown: UiKit['Dropdown'] = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = React.useState(false);

  return React.createElement('div', { className: 'relative inline-block' },
    React.createElement('div', { onClick: () => setOpen(!open) }, trigger),
    open && React.createElement(React.Fragment, null,
      React.createElement('div', {
        className: 'fixed inset-0 z-40',
        onClick: () => setOpen(false),
      }),
      React.createElement('div', {
        className: cn(
          'absolute z-50 mt-2 min-w-[160px] bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1',
          align === 'right' ? 'right-0' : 'left-0'
        ),
      },
        items.map((item, idx) =>
          React.createElement('button', {
            key: idx,
            onClick: () => {
              if (!item.disabled) {
                item.onClick();
                setOpen(false);
              }
            },
            disabled: item.disabled,
            className: cn(
              'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
              item.disabled && 'opacity-50 cursor-not-allowed',
              item.danger
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-gray-200 hover:bg-gray-800'
            ),
          },
            item.icon,
            item.label
          )
        )
      )
    )
  );
};

// =============================================================================
// EXPORT ERP KIT
// =============================================================================

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
