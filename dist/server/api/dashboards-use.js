// API: /api/dashboards/[id]/use
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { dashboards, dashboardShares } from '@/lib/feature-pack-schemas';
import { and, eq, inArray, or } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function PATCH(request, { params }) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const dashboardId = params.id;
        const [existing] = await db.select().from(dashboards).where(eq(dashboards.id, dashboardId)).limit(1);
        if (!existing)
            return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        // Allow "use" if owner, system, or shared with user.
        if (!existing.isSystem && existing.ownerUserId !== user.sub) {
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
            if (!share)
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        const [updated] = await db
            .update(dashboards)
            .set({ lastUsedAt: new Date(), updatedAt: new Date() })
            .where(eq(dashboards.id, dashboardId))
            .returning();
        return NextResponse.json({ data: updated });
    }
    catch (error) {
        console.error('Failed to mark dashboard used:', error);
        return NextResponse.json({ error: error?.message || 'Failed to mark used' }, { status: 500 });
    }
}
