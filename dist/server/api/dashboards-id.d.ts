import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
export declare function GET(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
export declare function PUT(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: any;
}>>;
export declare function DELETE(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
}> | NextResponse<{
    error: any;
}>>;
//# sourceMappingURL=dashboards-id.d.ts.map