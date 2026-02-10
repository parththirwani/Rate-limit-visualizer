import crypto from "crypto";
import { NextResponse } from "next/server";
export function GET() {
    try {
        const apiKey = "test_api_"+crypto.randomBytes(32).toString("hex");
        return NextResponse.json({
            "apikey": apiKey,
            status: 200
        })
    } catch (err) {
        console.log(err)
        return NextResponse.json({
            message: "Something wrong with server try again",
            status:500
        })
    }
}

