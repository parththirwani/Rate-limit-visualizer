import {z} from "zod"

export const testSchema = z.object({
    apiKey: z.string().min(32,"Api should be atleasat 32 chars"),
    requests: z.number().int().min(1).max(10),
    algorithm: z.enum(["FIXED_WINDOW","SLIDING_WINDOW","TOKEN_BUCKET"])
})