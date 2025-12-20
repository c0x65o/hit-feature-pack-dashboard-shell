// API: /api/dashboard-definitions
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/dashboard-definitions?pack=projects&includeGlobal=true
 *
 * Returns dashboards visible to the user:
 * - public dashboards
 * - dashboards owned by the user
 * - dashboards shared with the user (user/group/role)
 *
 * Optional filtering:
 * - pack=<name>: include pack dashboards for that pack, plus globals if includeGlobal=true (default)
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const pack = (searchParams.get('pack') || '').trim();
        const includeGlobal = (searchParams.get('includeGlobal') || 'true').toLowerCase() !== 'false';
        const userGroups = user.groups || [];
        const userRoles = user.roles || [];
        const scopeFilter = pack
            ? sql `(
            (d."scope"->>'kind' = 'pack' AND d."scope"->>'pack' = ${pack})
            OR (${includeGlobal} AND d."scope"->>'kind' = 'global')
          )`
            : sql `true`;
        const groupList = userGroups.map((g) => sql `${g}`);
        const roleList = userRoles.map((r) => sql `${r}`);
        const sharedAccess = userGroups.length || userRoles.length
            ? sql `exists (
            select 1
            from "dashboard_definition_shares" s
            where s.dashboard_id = d.id
              and (
                (s.principal_type = 'user' and s.principal_id = ${user.sub})
                ${userGroups.length ? sql `or (s.principal_type = 'group' and s.principal_id in (${sql.join(groupList, sql `, `)}))` : sql ``}
                ${userRoles.length ? sql `or (s.principal_type = 'role' and s.principal_id in (${sql.join(roleList, sql `, `)}))` : sql ``}
              )
          )`
            : sql `exists (
            select 1
            from "dashboard_definition_shares" s
            where s.dashboard_id = d.id
              and (s.principal_type = 'user' and s.principal_id = ${user.sub})
          )`;
        const rows = await db.execute(sql `
      select
        d.id,
        d.key,
        d.name,
        d.description,
        d.owner_user_id as "ownerUserId",
        d.is_system as "isSystem",
        d.visibility,
        d.scope,
        d.version,
        d.updated_at as "updatedAt",
        (select count(*)::int from "dashboard_definition_shares" s where s.dashboard_id = d.id) as "shareCount"
      from "dashboard_definitions" d
      where
        ${scopeFilter}
        and (
          d.visibility = 'public'
          or d.owner_user_id = ${user.sub}
          or ${sharedAccess}
        )
      order by
        case when d.scope->>'kind' = 'global' then 0 else 1 end,
        d.name asc
    `);
        return NextResponse.json({ data: rows.rows || [] });
    }
    catch (error) {
        console.error('Failed to list dashboard definitions:', error);
        return NextResponse.json({ error: error?.message || 'Failed to list dashboards' }, { status: 500 });
    }
}
