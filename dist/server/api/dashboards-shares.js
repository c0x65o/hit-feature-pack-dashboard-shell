// API: /api/dashboards/[id]/shares
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { dashboards, dashboardShares } from '@/lib/feature-pack-schemas';
import { and, eq } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function isAdmin(roles) {
    return roles?.includes('admin') || false;
}
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
        if (dash.ownerUserId !== user.sub)
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        const shares = await db
            .select()
            .from(dashboardShares)
            .where(eq(dashboardShares.dashboardId, dashboardId))
            .orderBy(dashboardShares.createdAt);
        return NextResponse.json({ data: shares });
    }
    catch (error) {
        console.error('Failed to list dashboard shares:', error);
        return NextResponse.json({ error: error?.message || 'Failed to list shares' }, { status: 500 });
    }
}
export async function POST(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const body = await request.json();
        const { principalType, principalId } = body || {};
        if (!principalType || !principalId) {
            return NextResponse.json({ error: 'principalType and principalId are required' }, { status: 400 });
        }
        if (!['user', 'group', 'role'].includes(principalType)) {
            return NextResponse.json({ error: 'principalType must be user, group, or role' }, { status: 400 });
        }
        if (!isAdmin(user.roles) && principalType !== 'user') {
            return NextResponse.json({ error: 'Only admins can share dashboards with groups or roles. You can share with individual users.' }, { status: 403 });
        }
        const [dash] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!dash)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        if (dash.ownerUserId !== user.sub) {
            return NextResponse.json({ error: 'Access denied - only the dashboard owner can share it' }, { status: 403 });
        }
        if (dash.isSystem)
            return NextResponse.json({ error: 'Cannot share system dashboards' }, { status: 400 });
        if (principalType === 'user' && principalId === user.sub) {
            return NextResponse.json({ error: 'Cannot share a dashboard with yourself' }, { status: 400 });
        }
        const [existingShare] = await db
            .select()
            .from(dashboardShares)
            .where(and(eq(dashboardShares.dashboardId, dashboardId), eq(dashboardShares.principalType, principalType), eq(dashboardShares.principalId, principalId)))
            .limit(1);
        if (existingShare)
            return NextResponse.json({ error: 'Dashboard is already shared with this principal' }, { status: 409 });
        const [share] = await db
            .insert(dashboardShares)
            .values({
            dashboardId,
            principalType,
            principalId,
            sharedBy: user.sub,
            sharedByName: user.name || user.email || user.sub,
        })
            .returning();
        await db.update(dashboards).set({ isShared: true, updatedAt: new Date() }).where(eq(dashboards.id, dashboardId));
        return NextResponse.json({ data: share });
    }
    catch (error) {
        console.error('Failed to share dashboard:', error);
        return NextResponse.json({ error: error?.message || 'Failed to share dashboard' }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const { searchParams } = new URL(request.url);
        const principalType = searchParams.get('principalType');
        const principalId = searchParams.get('principalId');
        if (!principalType || !principalId) {
            return NextResponse.json({ error: 'principalType and principalId query params are required' }, { status: 400 });
        }
        const [dash] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!dash)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        if (dash.ownerUserId !== user.sub) {
            return NextResponse.json({ error: 'Access denied - only the dashboard owner can remove shares' }, { status: 403 });
        }
        const deleted = await db
            .delete(dashboardShares)
            .where(and(eq(dashboardShares.dashboardId, dashboardId), eq(dashboardShares.principalType, principalType), eq(dashboardShares.principalId, principalId)))
            .returning();
        if (deleted.length === 0)
            return NextResponse.json({ error: 'Share entry not found' }, { status: 404 });
        const remaining = await db.select().from(dashboardShares).where(eq(dashboardShares.dashboardId, dashboardId)).limit(1);
        if (remaining.length === 0) {
            await db.update(dashboards).set({ isShared: false, updatedAt: new Date() }).where(eq(dashboards.id, dashboardId));
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Failed to remove dashboard share:', error);
        return NextResponse.json({ error: error?.message || 'Failed to remove share' }, { status: 500 });
    }
}
