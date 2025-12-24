import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        console.log("Webhook hit (simplified)");
        const body = await req.json();
        console.log("Body:", JSON.stringify(body));
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("Error:", e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "active-debug" });
}
