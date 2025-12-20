'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button, Card, Dropdown } from '@hit/ui-kit';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import { ChevronDown, Edit3, Eye, Plus, LayoutDashboard } from 'lucide-react';
const RGL = WidthProvider(GridLayout);
function getIdFromPath() {
    if (typeof window === 'undefined')
        return null;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('dashboards');
    if (idx === -1)
        return null;
    return parts[idx + 1] || null;
}
export function DashboardDetail() {
    const [dashboard, setDashboard] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const saveTimerRef = React.useRef(null);
    const [mode, setMode] = React.useState('view');
    const [availableDashboards, setAvailableDashboards] = React.useState([]);
    const dashboardId = React.useMemo(() => getIdFromPath(), []);
    const load = React.useCallback(async () => {
        if (!dashboardId)
            return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`/api/dashboards/${dashboardId}`);
            const json = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(json?.error || `Failed to load dashboard (${res.status})`);
            setDashboard(json.data);
            // mark as used (best-effort)
            fetch(`/api/dashboards/${dashboardId}/use`, { method: 'PATCH' }).catch(() => { });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setLoading(false);
        }
    }, [dashboardId]);
    React.useEffect(() => {
        load();
    }, [load]);
    // Load dashboard list for switcher (best-effort; scoped by pack if dashboard metadata includes it)
    React.useEffect(() => {
        let cancelled = false;
        async function loadList() {
            try {
                const pack = dashboard?.metadata?.pack;
                const url = pack ? `/api/dashboards?pack=${encodeURIComponent(pack)}` : '/api/dashboards';
                const res = await fetch(url);
                const json = await res.json().catch(() => ({}));
                if (!res.ok)
                    return;
                const items = Array.isArray(json.data) ? json.data : [];
                const mapped = items
                    .map((d) => ({ id: String(d.id), name: String(d.name || 'Untitled') }))
                    .filter((d) => d.id);
                if (!cancelled)
                    setAvailableDashboards(mapped);
            }
            catch {
                // ignore
            }
        }
        if (dashboard)
            loadList();
        return () => {
            cancelled = true;
        };
    }, [dashboard]);
    const saveWidgetsDebounced = React.useCallback(async (nextWidgets) => {
        if (!dashboardId)
            return;
        if (saveTimerRef.current)
            clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            try {
                setSaving(true);
                const res = await fetch(`/api/dashboards/${dashboardId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgets: nextWidgets }),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok)
                    throw new Error(json?.error || `Failed to update dashboard (${res.status})`);
                setDashboard(json.data);
            }
            catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            }
            finally {
                setSaving(false);
            }
        }, 500);
    }, [dashboardId]);
    React.useEffect(() => {
        return () => {
            if (saveTimerRef.current)
                clearTimeout(saveTimerRef.current);
        };
    }, []);
    const addPlaceholderWidget = React.useCallback(async () => {
        if (!dashboardId || !dashboard)
            return;
        try {
            setError(null);
            const nextWidgets = [
                ...(dashboard.widgets || []),
                {
                    // id intentionally omitted; backend will create and return it
                    type: 'kpi',
                    title: 'New KPI',
                    querySpec: { metricKey: 'revenue_usd', bucket: 'none', agg: 'sum' },
                    presentation: { format: 'usd' },
                    layout: { x: 0, y: 0, w: 3, h: 2 },
                    sortOrder: (dashboard.widgets?.length || 0) + 1,
                },
            ];
            await saveWidgetsDebounced(nextWidgets);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
        }
    }, [dashboard, dashboardId]);
    const toRglLayout = React.useMemo(() => {
        const widgets = dashboard?.widgets || [];
        const layout = widgets.map((w) => {
            const l = (w.layout && typeof w.layout === 'object') ? w.layout : {};
            return {
                i: w.id,
                x: typeof l.x === 'number' ? l.x : 0,
                y: typeof l.y === 'number' ? l.y : 0,
                w: typeof l.w === 'number' ? l.w : 3,
                h: typeof l.h === 'number' ? l.h : 2,
                minW: typeof l.minW === 'number' ? l.minW : 2,
                minH: typeof l.minH === 'number' ? l.minH : 2,
                maxW: typeof l.maxW === 'number' ? l.maxW : undefined,
                maxH: typeof l.maxH === 'number' ? l.maxH : undefined,
            };
        });
        return layout;
    }, [dashboard?.widgets]);
    const handleLayoutChange = React.useCallback((nextLayout) => {
        if (!dashboard)
            return;
        if (dashboard.isSystem)
            return;
        if (mode !== 'edit')
            return;
        const byId = new Map();
        for (const l of nextLayout)
            byId.set(l.i, l);
        const nextWidgets = (dashboard.widgets || []).map((w) => {
            const l = byId.get(w.id);
            if (!l)
                return w;
            return {
                ...w,
                layout: {
                    ...(w.layout && typeof w.layout === 'object' ? w.layout : {}),
                    x: l.x,
                    y: l.y,
                    w: l.w,
                    h: l.h,
                    minW: l.minW,
                    minH: l.minH,
                    maxW: l.maxW,
                    maxH: l.maxH,
                },
            };
        });
        // Update sortOrder by (y,x) so list order is stable if used elsewhere
        const withSort = nextWidgets
            .map((w) => ({
            ...w,
            _sortKeyY: typeof w.layout?.y === 'number' ? w.layout.y : 0,
            _sortKeyX: typeof w.layout?.x === 'number' ? w.layout.x : 0,
        }))
            .sort((a, b) => (a._sortKeyY - b._sortKeyY) || (a._sortKeyX - b._sortKeyX))
            .map((w, idx) => {
            const { _sortKeyY, _sortKeyX, ...rest } = w;
            return { ...rest, sortOrder: idx };
        });
        // Optimistically update UI immediately; backend save is debounced
        setDashboard({ ...dashboard, widgets: withSort });
        saveWidgetsDebounced(withSort);
    }, [dashboard, mode, saveWidgetsDebounced]);
    if (!dashboardId) {
        return _jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Missing dashboard id." });
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: dashboard?.name || (loading ? 'Loading…' : 'Dashboard') }), _jsx("p", { className: "text-muted-foreground", children: dashboard?.description || `Scope: ${dashboard?.scopeKind || '—'}` })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Dropdown, { align: "right", trigger: _jsx(Button, { variant: "secondary", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(LayoutDashboard, { size: 16 }), "Switch", _jsx(ChevronDown, { size: 14 })] }) }), items: [
                                    ...availableDashboards.map((d) => ({
                                        label: d.id === dashboardId ? `${d.name} (current)` : d.name,
                                        icon: null,
                                        disabled: d.id === dashboardId,
                                        onClick: () => {
                                            window.location.href = `/dashboards/${d.id}`;
                                        },
                                    })),
                                    {
                                        label: 'All dashboards',
                                        icon: null,
                                        onClick: () => {
                                            const pack = dashboard?.metadata?.pack;
                                            window.location.href = pack ? `/dashboards?pack=${encodeURIComponent(pack)}` : '/dashboards';
                                        },
                                    },
                                ] }), _jsx(Button, { variant: mode === 'edit' ? 'default' : 'secondary', onClick: () => setMode((m) => (m === 'edit' ? 'view' : 'edit')), disabled: !dashboard || dashboard.isSystem, children: _jsxs("span", { className: "flex items-center gap-2", children: [mode === 'edit' ? _jsx(Eye, { size: 16 }) : _jsx(Edit3, { size: 16 }), mode === 'edit' ? 'Done' : 'Edit'] }) }), mode === 'edit' ? (_jsx(Button, { onClick: addPlaceholderWidget, disabled: saving || !dashboard || dashboard.isSystem, children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Plus, { size: 16 }), "Add widget"] }) })) : null] })] }), error ? _jsx("div", { className: "text-sm text-red-600", children: error }) : null, _jsx("style", { children: `
        .rgl-grid { background: transparent; }
        .react-grid-item { transition: none; }
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.15);
          border: 1px dashed rgba(59, 130, 246, 0.6);
          border-radius: 12px;
        }
        .react-resizable-handle { opacity: 0; transition: opacity 150ms ease; }
        .is-edit .react-resizable-handle { opacity: 1; }
        .react-resizable-handle::after {
          content: '';
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 10px;
          height: 10px;
          border-right: 2px solid rgba(148, 163, 184, 0.75);
          border-bottom: 2px solid rgba(148, 163, 184, 0.75);
          border-radius: 2px;
        }
        .widget-card {
          height: 100%;
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .widget-header {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
          cursor: grab;
          user-select: none;
        }
        .widget-header:active { cursor: grabbing; }
        .widget-title { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .widget-meta { font-size: 12px; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .widget-body { padding: 12px; font-size: 12px; opacity: 0.85; }
      ` }), _jsxs(Card, { title: "Layout", description: "Drag + resize widgets. Layout auto-saves (debounced).", children: [_jsxs("div", { className: "text-sm text-muted-foreground mb-3", children: [loading ? 'Loading…' : `${dashboard?.widgets?.length || 0} widgets`, saving ? ' • Saving…' : '', dashboard?.isSystem ? ' • System dashboard' : '', dashboard?.metadata?.pack ? ` • Pack: ${dashboard.metadata.pack}` : ' • Global', dashboard && !dashboard.isSystem ? ` • ${mode === 'edit' ? 'Edit mode (drag enabled)' : 'View mode (locked)'}` : ''] }), !loading && (dashboard?.widgets?.length || 0) === 0 ? (_jsxs("div", { className: "text-sm text-muted-foreground", children: ["No widgets yet. Switch to ", _jsx("strong", { children: "Edit" }), " to add and arrange widgets."] })) : null, (dashboard?.widgets?.length || 0) > 0 ? (_jsx("div", { style: { width: '100%' }, className: mode === 'edit' ? 'is-edit' : '', children: _jsx(RGL, { className: "rgl-grid", cols: 12, rowHeight: 40, margin: [12, 12], containerPadding: [0, 0], layout: toRglLayout, draggableHandle: ".widget-header", isDraggable: !dashboard?.isSystem && mode === 'edit', isResizable: !dashboard?.isSystem && mode === 'edit', onLayoutChange: handleLayoutChange, compactType: "vertical", preventCollision: false, children: (dashboard?.widgets || []).map((w) => (_jsx("div", { children: _jsxs("div", { className: "widget-card", children: [_jsxs("div", { className: "widget-header", children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { className: "widget-title", children: w.title || '(untitled)' }), _jsxs("div", { className: "widget-meta", children: [w.type, " \u2022 metricKey: ", String(w?.querySpec?.metricKey || '—')] })] }), _jsxs("div", { className: "widget-meta", children: ["#", w.sortOrder] })] }), _jsx("div", { className: "widget-body", children: mode === 'edit'
                                                ? 'Drag by the header and resize from the corner. Changes save automatically.'
                                                : 'View mode. (Next: render real KPI/line/pie content here.)' })] }) }, w.id))) }) })) : null] })] }));
}
export default DashboardDetail;
