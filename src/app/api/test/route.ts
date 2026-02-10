import { testSchema } from "@/src/schema/test";
import { NextRequest, NextResponse } from "next/server";
import { loopFixedRequests } from "../../lib/FixedLimitter";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const parsedData = testSchema.safeParse(body);

        if (!parsedData.success) {
            return NextResponse.json(
                { message: "Invalid data input" },
                { status: 400 }
            );
        }

        const { apiKey, requests, algorithm } = parsedData.data;

        if (algorithm === "FIXED_WINDOW") {
            const result = await loopFixedRequests(requests, apiKey);

            return NextResponse.json({
                algorithm: "FIXED_WINDOW",
                ...result
            });
        }

        


    } catch (err) {
        console.log(err);

        return NextResponse.json(
            { message: "Something wrong with server try again" },
            { status: 500 }
        );
    }
}
