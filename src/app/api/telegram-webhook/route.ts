import { bot } from '@/bot/logic';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await bot.handleUpdate(body);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('Webhook error:', e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'active', mode: 'webhook' });
}
