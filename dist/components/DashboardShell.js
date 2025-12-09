'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Menu, Bell, User, Settings, LogOut, ChevronRight, ChevronDown, } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { UiKitProvider } from '@hit/ui-kit';
import { erpKit } from '../kit';
// =============================================================================
// DESIGN SYSTEM (matches kit.ts exactly)
// =============================================================================
const colors = {
    bg: {
        page: '#0a0a0f',
        surface: '#12121a',
        elevated: '#1a1a24',
        sidebar: '#0d0d12',
    },
    border: {
        subtle: '#1f1f2e',
        default: '#2a2a3d',
    },
    text: {
        primary: '#f4f4f5',
        secondary: '#a1a1aa',
        muted: '#71717a',
    },
    primary: {
        default: '#3b82f6',
        hover: '#2563eb',
    },
    error: {
        default: '#ef4444',
    },
};
const ShellContext = createContext(null);
export function useShell() {
    const context = useContext(ShellContext);
    if (!context)
        throw new Error('useShell must be used within DashboardShell');
    return context;
}
// =============================================================================
// NAV GROUP HELPERS
// =============================================================================
/** Group configuration with display labels */
const groupConfig = {
    main: { label: 'MAIN', order: 1 },
    system: { label: 'SYSTEM', order: 2 },
};
/** Group nav items by their group property, sorted by weight within each group */
function groupNavItems(items) {
    const groups = {};
    // Group items
    items.forEach((item) => {
        const group = item.group || 'main'; // Default to 'main' if no group specified
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
    });
    // Sort items within each group by weight
    Object.keys(groups).forEach((group) => {
        groups[group].sort((a, b) => (a.weight ?? 500) - (b.weight ?? 500));
    });
    // Convert to array and sort groups by their configured order
    return Object.entries(groups)
        .map(([group, items]) => ({
        group,
        label: groupConfig[group]?.label || group.toUpperCase(),
        items,
    }))
        .sort((a, b) => {
        const orderA = groupConfig[a.group]?.order ?? 999;
        const orderB = groupConfig[b.group]?.order ?? 999;
        return orderA - orderB;
    });
}
// =============================================================================
// FEATURE FLAG HELPERS
// =============================================================================
function isFlagEnabled(flag, cfg, authFeatures) {
    if (!flag)
        return true;
    // First check auth module features (snake_case from API)
    if (authFeatures) {
        const authLookup = {
            'auth.allowSignup': 'allow_signup',
            'auth.allow_signup': 'allow_signup',
            'auth.emailVerification': 'email_verification',
            'auth.email_verification': 'email_verification',
            'auth.passwordLogin': 'password_login',
            'auth.password_login': 'password_login',
            'auth.passwordReset': 'password_reset',
            'auth.password_reset': 'password_reset',
            'auth.magicLinkLogin': 'magic_link_login',
            'auth.magic_link_login': 'magic_link_login',
            'auth.twoFactorAuth': 'two_factor_auth',
            'auth.two_factor_auth': 'two_factor_auth',
            'auth.auditLog': 'audit_log',
            'auth.audit_log': 'audit_log',
        };
        const authKey = authLookup[flag];
        if (authKey && authFeatures[authKey] !== undefined) {
            return authFeatures[authKey] !== false;
        }
    }
    // Fallback to hit-config.json (camelCase)
    const auth = cfg?.auth || {};
    const admin = cfg?.admin || {};
    const lookup = {
        'auth.allowSignup': auth.allowSignup,
        'auth.emailVerification': auth.emailVerification,
        'auth.passwordLogin': auth.passwordLogin,
        'auth.passwordReset': auth.passwordReset,
        'auth.magicLinkLogin': auth.magicLinkLogin,
        'auth.twoFactorAuth': auth.twoFactorAuth,
        'auth.auditLog': auth.auditLog,
        'auth.show2faSetup': auth.show2faSetup,
        'auth.showSocialLogin': auth.showSocialLogin,
        'admin.showDashboard': admin.showDashboard,
        'admin.showUsers': admin.showUsers,
        'admin.showSessions': admin.showSessions,
        'admin.showAuditLog': admin.showAuditLog,
        'admin.showInvites': admin.showInvites,
        'admin.showPermissions': admin.showPermissions,
        'admin.showSettings': admin.showSettings,
    };
    const value = lookup[flag];
    return value !== undefined ? value : true;
}
function filterNavByFlags(items, cfg, authFeatures) {
    return items
        .filter((item) => isFlagEnabled(item.featureFlag, cfg, authFeatures))
        .map((item) => {
        if (!item.children) {
            return item;
        }
        const children = filterNavByFlags(item.children, cfg, authFeatures);
        return {
            ...item,
            children: children.length > 0 ? children : undefined,
        };
    });
}
function NavItemComponent({ item, level = 0, activePath, onNavigate }) {
    const { expandedNodes, toggleNode, setMenuOpen } = useShell();
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.id);
    const isActive = activePath === item.path || (hasChildren && item.children?.some(child => child.path === activePath));
    // Get icon component
    const iconName = item.icon
        ? item.icon.charAt(0).toUpperCase() + item.icon.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        : '';
    const IconComponent = item.icon
        ? LucideIcons[iconName]
        : null;
    const handleClick = () => {
        if (hasChildren) {
            toggleNode(item.id);
        }
        else if (item.path) {
            if (onNavigate) {
                onNavigate(item.path);
            }
            else if (typeof window !== 'undefined') {
                window.location.href = item.path;
            }
            // Menu stays open - don't auto-close on navigation
        }
    };
    // Check if any child is active (for highlighting parent)
    const hasActiveChild = hasChildren && item.children?.some(child => child.path === activePath);
    return (_jsxs("div", { children: [_jsxs("button", { onClick: handleClick, style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: level > 0 ? `calc(100% - ${level * 12}px)` : '100%',
                    padding: level > 0 ? '8px 12px 8px 36px' : '10px 12px',
                    marginLeft: level > 0 ? `${level * 12}px` : '0',
                    marginBottom: '2px',
                    fontSize: level === 0 ? '14px' : '13px',
                    fontWeight: level === 0 ? '500' : '400',
                    color: (isActive && !hasChildren) ? '#ffffff' : hasActiveChild ? colors.text.primary : colors.text.secondary,
                    backgroundColor: (isActive && !hasChildren) ? colors.primary.default : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                }, onMouseEnter: (e) => {
                    if (!(isActive && !hasChildren)) {
                        e.currentTarget.style.backgroundColor = colors.bg.elevated;
                        e.currentTarget.style.color = colors.text.primary;
                    }
                }, onMouseLeave: (e) => {
                    if (!(isActive && !hasChildren)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = hasActiveChild ? colors.text.primary : colors.text.secondary;
                    }
                }, children: [IconComponent && _jsx(IconComponent, { size: 18, style: { flexShrink: 0 } }), _jsx("span", { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: item.label }), item.badge !== undefined && (_jsx("span", { style: {
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            minWidth: '20px',
                            textAlign: 'center',
                        }, children: item.badge })), hasChildren && (_jsx("span", { style: { display: 'flex', marginRight: '-4px' }, children: isExpanded ? _jsx(ChevronDown, { size: 16 }) : _jsx(ChevronRight, { size: 16 }) }))] }), hasChildren && isExpanded && (_jsx("div", { style: { marginTop: '2px' }, children: item.children.map((child, idx) => (_jsx(NavItemComponent, { item: { ...child, id: `${item.id}-${idx}` }, level: level + 1, activePath: activePath, onNavigate: onNavigate }, `${item.id}-${idx}`))) }))] }));
}
// =============================================================================
// NAV GROUP HEADER COMPONENT
// =============================================================================
function NavGroupHeader({ label }) {
    return (_jsx("div", { style: {
            padding: '16px 12px 8px',
            fontSize: '11px',
            fontWeight: 600,
            color: colors.text.muted,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        }, children: label }));
}
// Module-level cache to persist state across client-side navigations
let menuStateCache = null;
let hitConfigCache = null;
let authConfigCache = null;
export function DashboardShell({ children, config: configProp = {}, navItems = [], user = null, activePath = '/', onNavigate, onLogout, initialNotifications = [], }) {
    // Initialize from cache or localStorage (client-only, no SSR concerns with ssr:false)
    const [menuOpen, setMenuOpenState] = useState(() => {
        if (menuStateCache !== null)
            return menuStateCache;
        const saved = localStorage.getItem('dashboard-shell-menu-open');
        const value = saved !== 'false'; // default to true
        menuStateCache = value;
        return value;
    });
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [hitConfig, setHitConfig] = useState(hitConfigCache);
    const [authConfig, setAuthConfig] = useState(authConfigCache);
    // Wrapper to update both state and cache
    const setMenuOpen = useCallback((open) => {
        menuStateCache = open;
        setMenuOpenState(open);
        localStorage.setItem('dashboard-shell-menu-open', String(open));
    }, []);
    // Load hit-config.json and auth config once
    useEffect(() => {
        // Load hit-config.json
        if (!hitConfigCache) {
            fetch('/hit-config.json')
                .then((res) => res.json())
                .then((data) => {
                hitConfigCache = data;
                setHitConfig(data);
            })
                .catch(() => setHitConfig(null));
        }
        // Load auth module config
        if (!authConfigCache) {
            fetch('/api/proxy/auth/config')
                .then((res) => res.json())
                .then((data) => {
                const features = data.features || {};
                authConfigCache = features;
                setAuthConfig(features);
            })
                .catch(() => {
                // If fetch fails, try to use hit-config.json auth section
                if (hitConfigCache?.auth) {
                    const mapped = {
                        allow_signup: hitConfigCache.auth.allowSignup,
                        password_reset: hitConfigCache.auth.passwordReset,
                        two_factor_auth: hitConfigCache.auth.twoFactorAuth,
                        audit_log: hitConfigCache.auth.auditLog,
                        magic_link_login: hitConfigCache.auth.magicLinkLogin,
                        email_verification: hitConfigCache.auth.emailVerification,
                    };
                    authConfigCache = mapped;
                    setAuthConfig(mapped);
                }
                else {
                    setAuthConfig(null);
                }
            });
        }
    }, []);
    const config = {
        brandName: configProp.brandName || 'HIT',
        logoUrl: configProp.logoUrl,
        sidebarPosition: configProp.sidebarPosition || 'left',
        showNotifications: configProp.showNotifications ?? true,
        showThemeToggle: configProp.showThemeToggle ?? false, // Disabled for now - dark only
        showUserMenu: configProp.showUserMenu ?? true,
        defaultTheme: 'dark',
    };
    // Set data-theme on document for CSS variable theming
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        }
    }, []);
    const toggleNode = useCallback((nodeId) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            }
            else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const contextValue = {
        menuOpen,
        setMenuOpen,
        expandedNodes,
        toggleNode,
    };
    // Icon button style helper
    const iconButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: 'none',
        border: 'none',
        borderRadius: '8px',
        color: colors.text.secondary,
        cursor: 'pointer',
        transition: 'all 150ms ease',
    };
    // Menu state is used directly (no hydration concerns with ssr:false)
    const showSidebar = menuOpen;
    return (_jsx(ShellContext.Provider, { value: contextValue, children: _jsxs("div", { style: {
                display: 'flex',
                height: '100vh',
                backgroundColor: colors.bg.page,
                color: colors.text.primary,
            }, children: [_jsxs("aside", { style: {
                        width: showSidebar ? '280px' : '0px',
                        minWidth: showSidebar ? '280px' : '0px',
                        height: '100%',
                        backgroundColor: colors.bg.sidebar,
                        borderRight: showSidebar ? `1px solid ${colors.border.subtle}` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        flexShrink: 0,
                    }, children: [_jsxs("div", { style: {
                                height: '64px',
                                minWidth: '280px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 16px',
                                borderBottom: `1px solid ${colors.border.subtle}`,
                                flexShrink: 0,
                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("div", { style: {
                                                width: '32px',
                                                height: '32px',
                                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }, children: config.logoUrl ? (_jsx("img", { src: config.logoUrl, alt: config.brandName, style: { width: '20px', height: '20px', objectFit: 'contain' } })) : (_jsx("span", { style: { color: '#fff', fontWeight: 700, fontSize: '14px' }, children: config.brandName.charAt(0) })) }), _jsx("span", { style: { fontSize: '16px', fontWeight: 600, color: colors.text.primary }, children: config.brandName })] }), _jsx("button", { onClick: () => setMenuOpen(false), style: {
                                        ...iconButtonStyle,
                                        width: '36px',
                                        height: '36px',
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = colors.bg.elevated;
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }, children: _jsx(Menu, { size: 20 }) })] }), _jsx("nav", { style: {
                                flex: 1,
                                overflowY: 'auto',
                                padding: '8px 12px',
                                minWidth: '280px',
                            }, children: groupNavItems(filterNavByFlags(navItems, hitConfig, authConfig)).map((group) => (_jsxs("div", { children: [_jsx(NavGroupHeader, { label: group.label }), group.items.map((item) => (_jsx(NavItemComponent, { item: item, activePath: activePath, onNavigate: onNavigate }, item.id)))] }, group.group))) }), _jsx("div", { style: {
                                padding: '16px',
                                borderTop: `1px solid ${colors.border.subtle}`,
                                flexShrink: 0,
                                minWidth: '280px',
                            }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.muted }, children: [_jsx("div", { style: {
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#22c55e',
                                            borderRadius: '50%',
                                        } }), _jsx("span", { children: "System Online" })] }) })] }), _jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [_jsxs("header", { style: {
                                height: '64px',
                                backgroundColor: colors.bg.surface,
                                borderBottom: `1px solid ${colors.border.subtle}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 24px',
                                flexShrink: 0,
                            }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: !showSidebar && (_jsx("button", { onClick: () => setMenuOpen(true), style: iconButtonStyle, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.bg.elevated;
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }, children: _jsx(Menu, { size: 20 }) })) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [config.showNotifications && (_jsx("div", { style: { position: 'relative' }, children: _jsxs("button", { onClick: () => {
                                                    setShowNotifications(!showNotifications);
                                                    setShowProfileMenu(false);
                                                }, style: iconButtonStyle, onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = colors.bg.elevated;
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }, children: [_jsx(Bell, { size: 20 }), unreadCount > 0 && (_jsx("span", { style: {
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            width: '18px',
                                                            height: '18px',
                                                            backgroundColor: colors.error.default,
                                                            color: '#fff',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }, children: unreadCount > 9 ? '9+' : unreadCount }))] }) })), config.showUserMenu && (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("button", { onClick: () => {
                                                        setShowProfileMenu(!showProfileMenu);
                                                        setShowNotifications(false);
                                                    }, style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '6px 12px 6px 6px',
                                                        background: 'none',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 150ms ease',
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.backgroundColor = colors.bg.elevated;
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }, children: [_jsx("div", { style: {
                                                                width: '36px',
                                                                height: '36px',
                                                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }, children: _jsx(User, { size: 18, style: { color: '#fff' } }) }), _jsxs("div", { style: { textAlign: 'left' }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 500, color: colors.text.primary }, children: user?.name || user?.email || 'User' }), _jsx("div", { style: { fontSize: '12px', color: colors.text.muted }, children: user?.roles?.[0] || 'Member' })] })] }), showProfileMenu && (_jsxs(_Fragment, { children: [_jsx("div", { onClick: () => setShowProfileMenu(false), style: { position: 'fixed', inset: 0, zIndex: 40 } }), _jsxs("div", { style: {
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: '100%',
                                                                marginTop: '8px',
                                                                width: '220px',
                                                                backgroundColor: colors.bg.surface,
                                                                border: `1px solid ${colors.border.default}`,
                                                                borderRadius: '8px',
                                                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                                                                zIndex: 50,
                                                                overflow: 'hidden',
                                                            }, children: [_jsxs("div", { style: { padding: '12px 16px', borderBottom: `1px solid ${colors.border.subtle}` }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: 500, color: colors.text.primary }, children: user?.name || 'User' }), _jsx("div", { style: { fontSize: '13px', color: colors.text.muted }, children: user?.email || '' })] }), _jsx("div", { style: { padding: '8px' }, children: [
                                                                        { icon: User, label: 'Profile' },
                                                                        { icon: Settings, label: 'Settings' },
                                                                    ].map((item) => (_jsxs("button", { style: {
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '10px',
                                                                            width: '100%',
                                                                            padding: '10px 12px',
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            color: colors.text.primary,
                                                                            fontSize: '14px',
                                                                            cursor: 'pointer',
                                                                            textAlign: 'left',
                                                                        }, onMouseEnter: (e) => {
                                                                            e.currentTarget.style.backgroundColor = colors.bg.elevated;
                                                                        }, onMouseLeave: (e) => {
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        }, children: [_jsx(item.icon, { size: 16, style: { color: colors.text.muted } }), item.label] }, item.label))) }), _jsx("div", { style: { padding: '8px', borderTop: `1px solid ${colors.border.subtle}` }, children: _jsxs("button", { onClick: () => {
                                                                            setShowProfileMenu(false);
                                                                            onLogout?.();
                                                                        }, style: {
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '10px',
                                                                            width: '100%',
                                                                            padding: '10px 12px',
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            color: colors.error.default,
                                                                            fontSize: '14px',
                                                                            cursor: 'pointer',
                                                                            textAlign: 'left',
                                                                        }, onMouseEnter: (e) => {
                                                                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                                                        }, onMouseLeave: (e) => {
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        }, children: [_jsx(LogOut, { size: 16 }), "Sign Out"] }) })] })] }))] }))] })] }), _jsx("main", { style: {
                                flex: 1,
                                overflow: 'auto',
                                padding: '24px',
                                backgroundColor: colors.bg.page,
                            }, onClick: () => {
                                setShowNotifications(false);
                                setShowProfileMenu(false);
                            }, children: _jsx("div", { style: { maxWidth: '1280px', margin: '0 auto' }, children: _jsx(UiKitProvider, { kit: erpKit, children: children }) }) })] })] }) }));
}
export default DashboardShell;
