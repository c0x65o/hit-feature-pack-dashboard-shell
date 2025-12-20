import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
export declare function GET(request: NextRequest, { params }: {
    params: {
        key: string;
    };
}): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
//# sourceMappingURL=dashboard-definitions-key.d.ts.map