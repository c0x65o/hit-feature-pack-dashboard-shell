import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    tableId: z.ZodString;
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tableId: string;
    ids: string[];
}, {
    tableId: string;
    ids: string[];
}>;
//# sourceMappingURL=table-data-batch.schema.d.ts.map