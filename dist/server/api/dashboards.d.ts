import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/dashboards
 * List dashboards visible to the user:
 * - system dashboards
 * - user's dashboards
 * - dashboards shared with the user (user/group/role)
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    data: any[];
}> | NextResponse<{
    error: any;
}>>;
/**
 * POST /api/dashboards
 * Create a dashboard.
 *
 * Body: { name, description?, scopeKind?, scopeId?, isDefault?, isSystem?, layoutVersion?, metadata? }
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
//# sourceMappingURL=dashboards.d.ts.map