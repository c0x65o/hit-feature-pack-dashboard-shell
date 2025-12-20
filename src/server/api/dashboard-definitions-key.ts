// API: /api/dashboard-definitions/[key]
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const key = decodeURIComponent(params.key || '').trim();
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    const db = getDb();
    const userGroups = (user.groups as string[]) || [];
    const userRoles = (user.roles as string[]) || [];

    const groupList = userGroups.map((g) => sql`${g}`);
    const roleList = userRoles.map((r) => sql`${r}`);
    const sharedAccess =
      userGroups.length || userRoles.length
        ? sql`exists (
            select 1
            from "dashboard_definition_shares" s
            where s.dashboard_id = d.id
              and (
                (s.principal_type = 'user' and s.principal_id = ${user.sub})
                ${userGroups.length ? sql`or (s.principal_type = 'group' and s.principal_id in (${sql.join(groupList, sql`, `)}))` : sql``}
                ${userRoles.length ? sql`or (s.principal_type = 'role' and s.principal_id in (${sql.join(roleList, sql`, `)}))` : sql``}
              )
          )`
        : sql`exists (
            select 1
            from "dashboard_definition_shares" s
            where s.dashboard_id = d.id
              and (s.principal_type = 'user' and s.principal_id = ${user.sub})
          )`;

    const result = await db.execute(sql`
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
        d.definition,
        d.updated_at as "updatedAt"
      from "dashboard_definitions" d
      where d.key = ${key}
      limit 1
    `);

    const row = ((result as any).rows || [])[0];
    if (!row) return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });

    const canRead =
      row.visibility === 'public' || row.ownerUserId === user.sub || (await (async () => {
        // Evaluate sharedAccess via a tiny SQL to keep logic consistent
        const check = await db.execute(sql`
          select 1 as ok
          from "dashboard_definitions" d
          where d.id = ${row.id}
            and (${sharedAccess})
          limit 1
        `);
        return Boolean(((check as any).rows || [])[0]);
      })());

    if (!canRead) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    return NextResponse.json({ data: row });
  } catch (error: any) {
    console.error('Failed to get dashboard definition:', error);
    return NextResponse.json({ error: error?.message || 'Failed to get dashboard' }, { status: 500 });
  }
}


