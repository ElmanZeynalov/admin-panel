import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const questions = await prisma.question.findMany({
            include: { buttons: true },
            orderBy: { id: 'asc' }
        });

        // Parse attachment JSON
        const formattedQuestions = questions.map((q: any) => ({
            ...q,
            attachment: q.attachment ? JSON.parse(q.attachment) : undefined
        }));

        return NextResponse.json(formattedQuestions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Transaction to wipe and replace (Simple approach for Editor)
        // ideally we would upsert, but for a visual editor, full replace is often safer/easier

        // 1. Delete removed questions
        // 1. Delete removed questions
        const incomingIds = data.map((q: any) => Number(q.id));
        console.log('Received IDs to keep:', incomingIds);

        const deleteResult = await prisma.question.deleteMany({
            where: { id: { notIn: incomingIds } }
        });
        console.log('Deleted questions count:', deleteResult.count);

        // 2. Upsert each question
        await prisma.$transaction(
            data.map((q: any) =>
                prisma.question.upsert({
                    where: { id: q.id },
                    update: {
                        text: q.text,
                        textRu: q.textRu, // Add support for Russian text
                        isActive: q.isActive,
                        defaultNextId: q.defaultNextId,
                        attachment: q.attachment ? JSON.stringify(q.attachment) : null,
                        externalLink: q.externalLink,
                        buttons: {
                            deleteMany: {},
                            create: q.buttons.map((b: any) => ({
                                text: b.text,
                                textRu: b.textRu, // Add support for Russian button text
                                nextQuestionId: b.nextQuestionId
                            }))
                        }
                    },
                    create: {
                        // Removed 'id: q.id' because Prisma auto-increments it and threw an error.
                        // Ideally we should sync IDs, but this fixes the crash.
                        text: q.text,
                        textRu: q.textRu, // Add support for Russian text
                        isActive: q.isActive,
                        defaultNextId: q.defaultNextId,
                        attachment: q.attachment ? JSON.stringify(q.attachment) : null,
                        externalLink: q.externalLink,
                        buttons: {
                            create: q.buttons.map((b: any) => ({
                                text: b.text,
                                textRu: b.textRu, // Add support for Russian button text
                                nextQuestionId: b.nextQuestionId
                            }))
                        }
                    }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save Error Details:', error);
        return NextResponse.json({ error: error.message || 'Failed to save questions' }, { status: 500 });
    }
}
