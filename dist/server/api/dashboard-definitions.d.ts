import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
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
export declare function GET(request: NextRequest): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
//# sourceMappingURL=dashboard-definitions.d.ts.map