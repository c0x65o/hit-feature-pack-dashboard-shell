import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
export declare function PATCH(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
//# sourceMappingURL=dashboards-use.d.ts.map