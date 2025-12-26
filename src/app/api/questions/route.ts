import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all questions
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

// POST: Handle both Single Create (Legacy/Auto) AND Bulk Sync (Manual Save)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // --- BULK SAVE (Global Save Button) ---
        if (Array.isArray(body)) {
            console.log('Doing Bulk Save of', body.length, 'items');

            const MAX_INT32 = 2147483647;

            // 1. Identify "Safe" IDs (existing DB records)
            const safeIds = body
                .map((q: any) => Number(q.id))
                .filter((id) => id > 0 && id <= MAX_INT32);

            // 2. Delete questions that are NOT in the Safe list (excluding new/temp items which aren't in DB yet anyway)
            // But wait, if we delete something that *was* in DB, it won't be in safeIds.
            // Correct.
            await prisma.question.deleteMany({
                where: { id: { notIn: safeIds } }
            });

            // 3. Update Existing (Safe) Items
            const safeItems = body.filter((q: any) => {
                const id = Number(q.id);
                return id > 0 && id <= MAX_INT32;
            });

            const updatedSafe = await prisma.$transaction(
                safeItems.map((q: any) => prisma.question.update({
                    where: { id: Number(q.id) },
                    data: {
                        text: q.text,
                        textRu: q.textRu,
                        parentId: q.parentId, // Safe to assume parentId is valid integer (either real ID or null) for existing items? 
                        // If an EXISTING item is moved to be a child of a NEW item (temp ID), this breaks.
                        // We should probably check mapping here too. 
                        // BUT: Moving categories is not a feature yet.
                        isActive: true,
                        answer: q.answer,
                        answerRu: q.answerRu,
                        externalLink: q.externalLink,
                        linkText: q.linkText,
                        linkTextRu: q.linkTextRu,
                        attachment: q.attachment ? JSON.stringify(q.attachment) : null
                    }
                }))
            );

            // 4. Create New Items with ID Mapping
            const newItems = body.filter((q: any) => {
                const id = Number(q.id);
                return id <= 0 || id > MAX_INT32;
            });

            // We need to insert in order of dependency.
            // Simple version: Parents first (parentId is null or existing), then Children (parentId is temp).
            // Since we only have 2 levels (Category -> Question), 2 passes is enough.

            const idMapping = new Map<number, number>(); // TempID -> RealID
            const createdItems: any[] = [];

            // Pass A: Items with parentId that is NULL or POSITIVE (Existing ID)
            // (Basically Categories and Questions under existing Categories)
            const passA = newItems.filter((q: any) => !q.parentId || (q.parentId > 0 && q.parentId <= MAX_INT32));

            for (const q of passA) {
                const created = await prisma.question.create({
                    data: {
                        text: q.text,
                        textRu: q.textRu,
                        parentId: q.parentId,
                        isActive: true,
                        answer: q.answer,
                        answerRu: q.answerRu,
                        externalLink: q.externalLink,
                        linkText: q.linkText,
                        linkTextRu: q.linkTextRu,
                        attachment: q.attachment ? JSON.stringify(q.attachment) : null
                    }
                });
                idMapping.set(Number(q.id), created.id);
                createdItems.push(created);
            }

            // Pass B: Items with parentId that is NEGATIVE (Temp ID)
            // (Questions under NEW Categories)
            const passB = newItems.filter((q: any) => q.parentId && (q.parentId <= 0 || q.parentId > MAX_INT32));

            for (const q of passB) {
                const realParentId = idMapping.get(Number(q.parentId));

                // If we can't find the parent, it might have been deleted or invalid.
                // We'll default to null or skip? Let's default null to safe crash.
                const finalParentId = realParentId || null;

                const created = await prisma.question.create({
                    data: {
                        text: q.text,
                        textRu: q.textRu,
                        parentId: finalParentId,
                        isActive: true,
                        answer: q.answer,
                        answerRu: q.answerRu,
                        externalLink: q.externalLink,
                        linkText: q.linkText,
                        linkTextRu: q.linkTextRu,
                        attachment: q.attachment ? JSON.stringify(q.attachment) : null
                    }
                });
                // No need to map these unless there is a 3rd level.
                createdItems.push(created);
            }

            // Combine all properly for response
            const allSaved = [...updatedSafe, ...createdItems];

            // Parse attachment JSON
            const formattedSaved = allSaved.map((q: any) => ({
                ...q,
                attachment: q.attachment ? JSON.parse(q.attachment) : undefined
            }));

            return NextResponse.json(formattedSaved);
        }

        // --- SINGLE CREATE (Legacy fallback, probably unused for Save All) ---
        else {
            if (!body.text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

            const newQuestion = await prisma.question.create({
                data: {
                    text: body.text,
                    textRu: body.textRu,
                    parentId: body.parentId,
                    isActive: true,
                    answer: body.answer,
                    answerRu: body.answerRu,
                    attachment: body.attachment ? JSON.stringify(body.attachment) : null
                }
            });
            return NextResponse.json(newQuestion);
        }

    } catch (error: any) {
        console.error('Save Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
    }
}

// DELETE: Kept for granular operations if needed, but Global Save typically handles deletion via omission.
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const numId = Number(id);

        // Manual recursive delete just in case
        await prisma.question.deleteMany({ where: { parentId: numId } });
        await prisma.question.delete({ where: { id: numId } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
