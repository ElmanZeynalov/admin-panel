
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bot } from '@/bot/logic';

export const dynamic = 'force-dynamic';

export async function GET() {
    const report: any = {
        env: {
            BOT_TOKEN_PREFIX: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.substring(0, 5) + '...' : 'MISSING',
            DATABASE_URL_SET: !!process.env.DATABASE_URL
        },
        db: 'PENDING',
        webhook: 'PENDING',
        time: new Date().toISOString()
    };

    // 1. Check DB
    try {
        const count = await prisma.user.count();
        report.db = `Connected. User Count: ${count}`;
    } catch (e: any) {
        report.db = `ERROR: ${e.message}`;
    }

    // 2. Check Webhook Info
    try {
        const info = await bot.telegram.getWebhookInfo();
        report.webhook = info;
    } catch (e: any) {
        report.webhook = `ERROR: ${e.message}`;
    }

    return NextResponse.json(report);
}
