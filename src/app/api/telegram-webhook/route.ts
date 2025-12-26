import { bot } from '@/bot/logic';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        console.log(' Telegram Webhook Received');
        const body = await req.json();
        await bot.handleUpdate(body);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('Webhook error:', e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        if (url.searchParams.get('setWebhook') === 'true') {
            const webhookUrl = `https://${req.headers.get('host')}/api/telegram-webhook`;
            await bot.telegram.setWebhook(webhookUrl);
            return NextResponse.json({ ok: true, message: 'Webhook set successfully', url: webhookUrl });
        }
        return NextResponse.json({ status: 'active', mode: 'webhook' });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
