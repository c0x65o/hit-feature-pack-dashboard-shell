import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    tableId: z.ZodString;
    columnKey: z.ZodString;
    entityKind: z.ZodString;
    pageSize: z.ZodOptional<z.ZodNumber>;
    bucketPages: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    tableId: string;
    columnKey: string;
    entityKind: string;
    pageSize?: number | undefined;
    bucketPages?: Record<string, number> | undefined;
}, {
    tableId: string;
    columnKey: string;
    entityKind: string;
    pageSize?: number | undefined;
    bucketPages?: Record<string, number> | undefined;
}>;
//# sourceMappingURL=table-data-grouped-buckets.schema.d.ts.map