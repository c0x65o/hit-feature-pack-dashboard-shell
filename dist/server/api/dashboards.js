// API: /api/dashboards
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { dashboards, dashboardShares, dashboardWidgets } from '@/lib/feature-pack-schemas';
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/dashboards
 * List dashboards visible to the user:
 * - system dashboards
 * - user's dashboards
 * - dashboards shared with the user (user/group/role)
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const pack = searchParams.get('pack');
        const packFilter = pack && pack.trim()
            ? sql `${dashboards.metadata} ->> 'pack' = ${pack.trim()}`
            : null;
        // User-owned dashboards
        const userDashboards = await db
            .select()
            .from(dashboards)
            .where(and(eq(dashboards.ownerUserId, user.sub), eq(dashboards.isSystem, false), packFilter ? packFilter : sql `true`))
            .orderBy(desc(dashboards.lastUsedAt), desc(dashboards.createdAt));
        // System dashboards
        const systemDashboards = await db
            .select()
            .from(dashboards)
            .where(and(eq(dashboards.isSystem, true), packFilter ? packFilter : sql `true`))
            .orderBy(desc(dashboards.isDefault), desc(dashboards.createdAt));
        // Shared dashboards
        const userGroups = user.groups || [];
        const userRoles = user.roles || [];
        const shareConditions = [
            and(eq(dashboardShares.principalType, 'user'), eq(dashboardShares.principalId, user.sub)),
        ];
        if (userGroups.length > 0) {
            shareConditions.push(and(eq(dashboardShares.principalType, 'group'), inArray(dashboardShares.principalId, userGroups)));
        }
        if (userRoles.length > 0) {
            shareConditions.push(and(eq(dashboardShares.principalType, 'role'), inArray(dashboardShares.principalId, userRoles)));
        }
        const sharedDashboardsData = await db
            .select({
            dashboard: dashboards,
            share: dashboardShares,
        })
            .from(dashboardShares)
            .innerJoin(dashboards, eq(dashboardShares.dashboardId, dashboards.id))
            .where(and(sql `${dashboards.ownerUserId} != ${user.sub}`, or(...shareConditions), packFilter ? packFilter : sql `true`))
            .orderBy(desc(dashboardShares.createdAt));
        // Deduplicate shared dashboards (user may have access via multiple principals)
        const sharedMap = new Map();
        for (const row of sharedDashboardsData) {
            if (!sharedMap.has(row.dashboard.id)) {
                sharedMap.set(row.dashboard.id, {
                    dashboard: row.dashboard,
                    sharedBy: row.share.sharedBy,
                    sharedByName: row.share.sharedByName,
                });
            }
        }
        const sharedDashboards = Array.from(sharedMap.values());
        const allIds = [
            ...userDashboards.map((d) => d.id),
            ...systemDashboards.map((d) => d.id),
            ...sharedDashboards.map((d) => d.dashboard.id),
        ];
        // Widget counts (for list view)
        const widgetCounts = new Map();
        if (allIds.length > 0) {
            const counts = await db
                .select({
                dashboardId: dashboardWidgets.dashboardId,
                cnt: sql `count(*)`.as('cnt'),
            })
                .from(dashboardWidgets)
                .where(inArray(dashboardWidgets.dashboardId, allIds))
                .groupBy(dashboardWidgets.dashboardId);
            for (const r of counts) {
                widgetCounts.set(String(r.dashboardId), Number(r.cnt || 0));
            }
        }
        const data = [
            ...systemDashboards.map((d) => ({
                ...d,
                widgetCount: widgetCounts.get(d.id) || 0,
                _category: 'system',
            })),
            ...userDashboards.map((d) => ({
                ...d,
                widgetCount: widgetCounts.get(d.id) || 0,
                _category: 'user',
            })),
            ...sharedDashboards.map((s) => ({
                ...s.dashboard,
                widgetCount: widgetCounts.get(s.dashboard.id) || 0,
                _category: 'shared',
                _sharedBy: s.sharedBy,
                _sharedByName: s.sharedByName,
            })),
        ];
        return NextResponse.json({ data });
    }
    catch (error) {
        console.error('Failed to fetch dashboards:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch dashboards' }, { status: 500 });
    }
}
/**
 * POST /api/dashboards
 * Create a dashboard.
 *
 * Body: { name, description?, scopeKind?, scopeId?, isDefault?, isSystem?, layoutVersion?, metadata? }
 */
export async function POST(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const body = await request.json();
        const { name, description, scopeKind, scopeId, isDefault, isSystem, layoutVersion, metadata } = body || {};
        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'name is required' }, { status: 400 });
        }
        const [dashboard] = await db
            .insert(dashboards)
            .values({
            ownerUserId: isSystem ? 'system' : user.sub,
            name,
            description: description || null,
            scopeKind: typeof scopeKind === 'string' ? scopeKind : 'global',
            scopeId: typeof scopeId === 'string' ? scopeId : null,
            isDefault: Boolean(isDefault),
            isSystem: Boolean(isSystem),
            isShared: false,
            layoutVersion: typeof layoutVersion === 'number' ? layoutVersion : 1,
            metadata: metadata && typeof metadata === 'object' ? metadata : null,
        })
            .returning();
        return NextResponse.json({ data: { ...dashboard, widgetCount: 0 } });
    }
    catch (error) {
        console.error('Failed to create dashboard:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create dashboard' }, { status: 500 });
    }
}
