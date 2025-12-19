import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Safe serialization for BigInt (Telegram ID)
        const safeUsers = users.map((user: any) => ({
            ...user,
            telegramId: user.telegramId.toString(),
            messages: user.messages.map((msg: any) => ({
                ...msg,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
        }));

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
