// API: /api/dashboards/[id]
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { dashboards, dashboardShares, dashboardWidgets } from '@/lib/feature-pack-schemas';
import { and, eq, inArray, or } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const [dash] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!dash)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        // Access control:
        // - system dashboards: readable by all authenticated users
        // - owner: readable
        // - shared: readable if user matches a share entry (user/group/role)
        if (!dash.isSystem && dash.ownerUserId !== user.sub) {
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
            const [share] = await db
                .select()
                .from(dashboardShares)
                .where(and(eq(dashboardShares.dashboardId, dashboardId), or(...shareConditions)))
                .limit(1);
            if (!share) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        }
        const widgets = await db
            .select()
            .from(dashboardWidgets)
            .where(eq(dashboardWidgets.dashboardId, dashboardId))
            .orderBy(dashboardWidgets.sortOrder);
        return NextResponse.json({ data: { ...dash, widgets } });
    }
    catch (error) {
        console.error('Failed to get dashboard:', error);
        return NextResponse.json({ error: error?.message || 'Failed to get dashboard' }, { status: 500 });
    }
}
export async function PUT(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const body = await request.json();
        const [existing] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!existing)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        if (existing.isSystem)
            return NextResponse.json({ error: 'Cannot modify system dashboards' }, { status: 403 });
        if (existing.ownerUserId !== user.sub)
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        const { name, description, isDefault, scopeKind, scopeId, layoutVersion, metadata, widgets } = body || {};
        const [updated] = await db
            .update(dashboards)
            .set({
            name: typeof name === 'string' ? name : existing.name,
            description: description !== undefined ? (description || null) : existing.description,
            isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
            scopeKind: typeof scopeKind === 'string' ? scopeKind : existing.scopeKind,
            scopeId: scopeId !== undefined ? (typeof scopeId === 'string' ? scopeId : null) : existing.scopeId,
            layoutVersion: typeof layoutVersion === 'number' ? layoutVersion : existing.layoutVersion,
            metadata: metadata !== undefined ? (metadata && typeof metadata === 'object' ? metadata : null) : existing.metadata,
            updatedAt: new Date(),
        })
            .where(eq(dashboards.id, dashboardId))
            .returning();
        // Upsert widgets if provided (preserves widget ids for stable layouts)
        if (widgets !== undefined) {
            const existingWidgets = await db
                .select()
                .from(dashboardWidgets)
                .where(eq(dashboardWidgets.dashboardId, dashboardId));
            const existingById = new Map();
            for (const w of existingWidgets) {
                existingById.set(String(w.id), w);
            }
            const incoming = Array.isArray(widgets) ? widgets : [];
            const incomingIds = new Set();
            // Update existing + insert new
            for (let idx = 0; idx < incoming.length; idx++) {
                const w = incoming[idx];
                const id = typeof w?.id === 'string' ? w.id : null;
                const type = String(w?.type || 'kpi');
                const title = typeof w?.title === 'string' ? w.title : '';
                const querySpec = w?.querySpec && typeof w.querySpec === 'object' ? w.querySpec : {};
                const presentation = w?.presentation && typeof w.presentation === 'object' ? w.presentation : {};
                const layout = w?.layout && typeof w.layout === 'object' ? w.layout : {};
                const sortOrder = typeof w?.sortOrder === 'number' ? w.sortOrder : idx;
                if (id && existingById.has(id)) {
                    incomingIds.add(id);
                    await db
                        .update(dashboardWidgets)
                        .set({
                        type,
                        title,
                        querySpec,
                        presentation,
                        layout,
                        sortOrder,
                        updatedAt: new Date(),
                    })
                        .where(eq(dashboardWidgets.id, id));
                }
                else {
                    const [created] = await db
                        .insert(dashboardWidgets)
                        .values({
                        dashboardId,
                        type,
                        title,
                        querySpec,
                        presentation,
                        layout,
                        sortOrder,
                    })
                        .returning();
                    incomingIds.add(String(created.id));
                }
            }
            // Delete removed widgets
            for (const existingId of existingById.keys()) {
                if (!incomingIds.has(existingId)) {
                    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, existingId));
                }
            }
        }
        const loadedWidgets = await db
            .select()
            .from(dashboardWidgets)
            .where(eq(dashboardWidgets.dashboardId, dashboardId))
            .orderBy(dashboardWidgets.sortOrder);
        return NextResponse.json({ data: { ...updated, widgets: loadedWidgets } });
    }
    catch (error) {
        console.error('Failed to update dashboard:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update dashboard' }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const [existing] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!existing)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        if (existing.isSystem)
            return NextResponse.json({ error: 'Cannot delete system dashboards' }, { status: 403 });
        if (existing.ownerUserId !== user.sub)
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        await db.delete(dashboards).where(eq(dashboards.id, dashboardId));
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Failed to delete dashboard:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete dashboard' }, { status: 500 });
    }
}
