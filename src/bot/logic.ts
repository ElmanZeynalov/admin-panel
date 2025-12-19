import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import prisma from '@/lib/prisma';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN must be provided!');
    // We don't exit here because in Next.js API route it might crash the server.
    // But for bot logic it's critical.
    if (process.env.NODE_ENV !== 'production') {
        // process.exit(1); 
    }
}

export const bot = new Telegraf(BOT_TOKEN || '');

// Helper to convert text to bold unicode (Mathematical Sans-Serif Bold)
const toBoldUnicode = (text: string) => {
    const map: { [key: string]: string } = {
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(char => map[char] || char).join('');
};

// Helper to send a question
const sendQuestion = async (ctx: any, questionId: number) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { buttons: true }
    });

    if (!question || !question.isActive) {
        return ctx.reply('Söhbət bitdi və ya sual tapılmadı.');
    }

    // Prepare buttons
    const buttons = question.buttons.map(b => Markup.button.callback(toBoldUnicode(b.text), `btn:${b.id}`));
    const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

    // Dynamic Link Replacement
    let displayText = `<b>${question.text}</b>`;
    if (question.externalLink) {
        // Ensure URL has protocol
        let url = question.externalLink;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Replace "burada" and any suffixes (e.g. "buradan", "buradakı") with link
        displayText = displayText.replace(/(burada\w*)/gi, `<a href="${url}">$1</a>`);
    }

    let messageSent = false;

    // Send Attachment if exists
    if (question.attachment) {
        try {
            const att = JSON.parse(question.attachment);
            if (att.url) {
                // Determine source: File on disk or URL
                let source;
                if (att.url.startsWith('/uploads')) {
                    // Local file
                    const path = require('path');
                    source = { source: path.join(process.cwd(), 'public', att.url) };
                } else if (att.url.startsWith('blob:')) {
                    console.warn(`[WARNING] Skipping blob URL attachment for Question ${questionId}. Please re-upload in Admin Panel.`);
                    // Fallback to text
                } else {
                    // Remote URL
                    source = att.url;
                }

                if (source) {
                    if (att.type === 'image') {
                        await ctx.replyWithPhoto(source, { caption: displayText, parse_mode: 'HTML', ...keyboard });
                        messageSent = true;
                    } else {
                        // Generic file
                        await ctx.replyWithDocument(source, { caption: displayText, parse_mode: 'HTML', ...keyboard });
                        messageSent = true;
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing attachment', e);
        }
    }

    if (!messageSent) {
        await ctx.reply(displayText, { ...keyboard, parse_mode: 'HTML' });
    }

    // Save Bot Message to History
    if (ctx.from) {
        const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
        if (user) {
            await prisma.message.create({
                data: {
                    userId: user.id,
                    text: question.text,
                    sender: 'bot'
                }
            });

            // Update User State
            await prisma.user.update({
                where: { id: user.id },
                data: { currentQuestionId: question.id }
            });

            console.log(`Saved Bot reply to ${user.username || user.telegramId} (State: Q${question.id})`);
        }
    }
};

// Helper to get or create user
const getOrCreateUser = async (ctx: any) => {
    const telegramId = BigInt(ctx.from.id);
    let user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                telegramId,
                username: ctx.from.username || null,
                fullName: null, // Will be set by first question
                isAnonim: false
            }
        });
    }
    return user;
};

// Start Command
bot.command('start', async (ctx) => {
    await getOrCreateUser(ctx);

    // Determine start question (lowest ID)
    const firstQuestion = await prisma.question.findFirst({
        where: { isActive: true },
        orderBy: { id: 'asc' }
    });

    if (firstQuestion) {
        await sendQuestion(ctx, firstQuestion.id);
    } else {
        ctx.reply('Bot hal-hazırda aktiv deyil.');
    }
});

// Helper to find next question ID
const getNextQuestionId = async (currentId: number, preferredNextId: number | null | undefined): Promise<number | null> => {
    // 1. Try explicit jump if provided
    if (preferredNextId) {
        // Verify this ID actually exists
        const exists = await prisma.question.findUnique({ where: { id: preferredNextId } });
        if (exists) return preferredNextId;
        // If it doesn't exist, fall through to sequential
        console.log(`Preferred next ID ${preferredNextId} not found, falling back to sequential.`);
    }

    // 2. Sequential fallback (Find the very next question available)
    const nextQ = await prisma.question.findFirst({
        where: { id: { gt: currentId }, isActive: true },
        orderBy: { id: 'asc' }
    });

    return nextQ ? nextQ.id : null;
};

// Button Action
bot.action(/btn:(\d+)/, async (ctx) => {
    const user = await getOrCreateUser(ctx);
    const btnId = parseInt(ctx.match[1]);
    const button = await prisma.button.findUnique({ where: { id: btnId } });

    // Save Action History
    if (button) {
        await prisma.message.create({
            data: {
                userId: user.id,
                text: `[Button]: ${button.text}`,
                sender: 'user'
            }
        });
        console.log(`Saved Button click from ${user.username || user.telegramId}`);
    }

    if (button?.text === 'ANONİM') {
        // Special Case: Set Anonim
        await prisma.user.update({
            where: { id: user.id },
            data: { isAnonim: true, fullName: 'Anonim' }
        });
        await ctx.answerCbQuery('Anonim rejim seçildi.');
    } else {
        await ctx.answerCbQuery();
    }

    if (button) {
        let nextId = await getNextQuestionId(user.currentQuestionId || 0, button.nextQuestionId);

        // If button has no nextId AND user has no currentQuestionId (edge case), try finding Q after the button's question
        if (!nextId && button.questionId) {
            nextId = await getNextQuestionId(button.questionId, null);
        }

        if (nextId) {
            if (nextId === -1) {
                await ctx.reply('Söhbət bitdi.');
            } else {
                await sendQuestion(ctx, nextId);
            }
        }
    }
});

// Text Handling
bot.on('text', async (ctx) => {
    const user = await getOrCreateUser(ctx);
    const text = ctx.message.text;

    // Save User Message
    await prisma.message.create({
        data: {
            userId: user.id,
            text: text,
            sender: 'user'
        }
    });
    console.log(`Saved Text from ${user.username || user.telegramId}: ${text}`);

    // Logic: If user has no name yet and not anonim, this text is their name
    // Assuming Question 1 is "Name Request"
    if (!user.fullName && !user.isAnonim) {
        await prisma.user.update({
            where: { id: user.id },
            data: { fullName: text }
        });
        // Move to Question 2 (assuming simple flow: 1 -> 2)
        // Find current question? Difficult without session.
        // Heuristic: If just registered, go to Q2.
        const secondQuestion = await prisma.question.findFirst({
            where: { id: { gt: 1 }, isActive: true },
            orderBy: { id: 'asc' }
        });

        if (secondQuestion) {
            await sendQuestion(ctx, secondQuestion.id);
        }
        return;
    }

    // Default flow for other messages
    // Ideally we need to know "Current Question" to use defaultNextId.
    // Simplifying: If text matches nothing, maybe reply generic?
    // Or try to find if this text answers the "current" question (if we tracked it).

    // Generic State Handling for Text
    if (user.currentQuestionId) {
        const currentQ = await prisma.question.findUnique({ where: { id: user.currentQuestionId } });

        if (currentQ) {
            const nextId = await getNextQuestionId(currentQ.id, currentQ.defaultNextId);

            if (nextId) {
                if (nextId === -1) {
                    await ctx.reply('Söhbət bitdi. Təşəkkürlər!');
                } else {
                    await sendQuestion(ctx, nextId);
                }
                return;
            }
        }
    }
    // Default Fallback: If we still don't know what to do, just acknowledge
    // ctx.reply('Məlumat qəbul edildi.'); 
});
