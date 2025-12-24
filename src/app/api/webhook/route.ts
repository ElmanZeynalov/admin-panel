import { bot } from "@/bot/logic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Webhook received:", JSON.stringify(body));

        // Handle the update
        // We wrap this in a try-catch to ensure we always return 200 to Telegram
        // otherwise it keeps retrying
        try {
            await bot.handleUpdate(body);
        } catch (e) {
            console.error("Error handling update:", e);
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Error in webhook route:", e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "active" });
}
