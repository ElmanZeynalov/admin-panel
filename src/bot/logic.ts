import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import prisma from '@/lib/prisma';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN must be provided!');
}

export const bot = new Telegraf(BOT_TOKEN || '');

// --- HELPERS ---

// Convert text to bold unicode (optional, but keeping it for style if valid)
const toBoldUnicode = (text: string) => {
    // Basic mapping or just return text if complex font not desired
    // Keeping it simple for now to avoid bugs, or stick to the map if preferred.
    // Let's stick to standard text for reliability unless requested.
    return text;
};

// Get User's Language
const getUserLang = async (userId: bigint) => {
    const user = await prisma.user.findUnique({ where: { telegramId: userId } });
    return user?.language || 'az'; // Default to az
};

// Get or Create User
const getOrCreateUser = async (ctx: any) => {
    const telegramId = BigInt(ctx.from.id);
    let user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                telegramId,
                username: ctx.from.username || null,
                fullName: ctx.from.first_name + (ctx.from.last_name ? ' ' + ctx.from.last_name : ''),
                isAnonim: false,
                language: 'az' // Default
            }
        });
    }
    return user;
};

// Dynamic Link Replacement
const replaceLinks = (text: string, linkUrl: string | null, linkText: string | null, lang: string) => {
    if (!linkUrl || !text) return text;

    let url = linkUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    const defaultLinkText = lang === 'ru' ? 'здесь' : 'burada';
    const targetText = linkText || defaultLinkText;

    // Case-insensitive replacement of the target word with HTML link
    // Escaping regex characters in targetText is safer but let's assume simple text for now
    const regex = new RegExp(`(${targetText})`, 'gi');
    return text.replace(regex, `<a href="${url}">$1</a>`);
};

// The Core Function: Send a Node (Category or Question/Answer)
const sendNode = async (ctx: any, nodeId: number | null) => {
    const user = await getOrCreateUser(ctx);
    const lang = user.language === 'ru' ? 'ru' : 'az';

    try {
        let items;
        let parentNode = null;
        let isRoot = false;

        // 1. Fetch Data
        if (nodeId === null) {
            // Root Level: Fetch Categories (parentId = null)
            items = await prisma.question.findMany({
                where: { parentId: null, isActive: true },
                orderBy: { id: 'asc' }
            });
            isRoot = true;
        } else {
            // Specific Node
            parentNode = await prisma.question.findUnique({ where: { id: nodeId } });

            // Check if this node has children
            items = await prisma.question.findMany({
                where: { parentId: nodeId, isActive: true },
                orderBy: { id: 'asc' }
            });
        }

        // 2. Logic: Is it a Menu (has children) or an Answer (no children)?
        const isMenu = items.length > 0 || isRoot;

        if (isMenu) {
            // --- RENDER MENU ---

            // Message Text
            let messageText = '';
            if (isRoot) {
                messageText = lang === 'ru' ? 'Главное меню:' : 'Əsas menyu:';
            } else if (parentNode) {
                // Showing children of a category/question
                // Use the parent's text as the header
                messageText = (lang === 'ru' && parentNode.textRu) ? parentNode.textRu : parentNode.text;

                // If the parent also had an answer/image itself, we could show it here, 
                // but usually for categories we just show the title.
            } else {
                messageText = 'Menu';
            }

            // Buttons
            const buttons = items.map(item => {
                const txt = (lang === 'ru' && item.textRu) ? item.textRu : item.text;
                return [Markup.button.callback(txt, `goto:${item.id}`)];
            });

            // Back Button (if not root)
            if (!isRoot && parentNode?.parentId !== undefined) {
                const backText = lang === 'ru' ? '🔙 Назад' : '🔙 Geri';
                // Go back to parent's parent (to view the list that contains current parent)
                // If parentId is null, we go to root (goto:root)
                const backPayload = parentNode.parentId === null ? 'goto:root' : `goto:${parentNode.parentId}`;
                buttons.push([Markup.button.callback(backText, backPayload)]);
            }

            await ctx.editMessageText(messageText, {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: buttons }
            }).catch(async (e: any) => {
                // If edit fails (e.g. old message was photo, new is text), modify flow to send new message
                await ctx.reply(messageText, {
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: buttons }
                });
            });

        } else if (parentNode) {
            // --- RENDER ANSWER (Leaf Node) ---
            // This node has no children, so it's an end-point. Show its answer.

            const answerTextRaw = (lang === 'ru' && parentNode.answerRu) ? parentNode.answerRu : parentNode.answer;
            const linkTx = (lang === 'ru' && parentNode.linkTextRu) ? parentNode.linkTextRu : parentNode.linkText;
            const questionTitle = (lang === 'ru' && parentNode.textRu) ? parentNode.textRu : parentNode.text;

            // Use fallback text if no answer defined
            let bodyText = answerTextRaw || questionTitle; // Default to title if no answer body

            // Link Replacement
            bodyText = replaceLinks(bodyText || '', parentNode.externalLink, linkTx, lang);

            // Construct Final Message: Title (Bold) + Body
            // If the body is just the title (because no answer), don't duplicate.
            let displayText = '';
            if (answerTextRaw) {
                displayText = `<b>${questionTitle}</b>\n\n${bodyText}`;
            } else {
                displayText = `<b>${bodyText}</b>`;
            }

            // Back Button
            const backText = lang === 'ru' ? '🔙 Назад' : '🔙 Geri';
            // Back to the Category that contained this question
            const backPayload = parentNode.parentId === null ? 'goto:root' : `goto:${parentNode.parentId}`;
            const keyboard = Markup.inlineKeyboard([[Markup.button.callback(backText, backPayload)]]);

            let sent = false;

            // Attachment Handling
            if (parentNode.attachment) {
                try {
                    const att = JSON.parse(parentNode.attachment);
                    if (att.url) {
                        let source;
                        if (att.url.startsWith('/uploads')) {
                            // Local file
                            source = { source: path.join(process.cwd(), 'public', att.url) };
                        } else {
                            // Remote
                            source = att.url;
                        }

                        if (att.type === 'image') {
                            await ctx.replyWithPhoto(source, { caption: displayText, parse_mode: 'HTML', ...keyboard });
                        } else {
                            await ctx.replyWithDocument(source, { caption: displayText, parse_mode: 'HTML', ...keyboard });
                        }
                        sent = true;
                    }
                } catch (e) {
                    console.error('Attachment error', e);
                }
            }

            if (!sent) {
                await ctx.reply(displayText, { parse_mode: 'HTML', ...keyboard });
            }
        }

    } catch (error) {
        console.error('SendNode Error:', error);
        await ctx.reply('Error loading menu.');
    }
};


// --- HANDLERS ---

bot.command('start', async (ctx) => {
    const user = await getOrCreateUser(ctx);

    // Language Check (Mocking the check logic, usually you'd ask if null)
    // For now, let's assume if lang is not set, we ask.
    // In our getOrCreateUser, we default to 'az', so it's always set.
    // Let's force language selection? Or just go to Root.

    // Let's show Root Menu
    await sendNode(ctx, null);
});

// Navigation Action
bot.action(/goto:(.+)/, async (ctx) => {
    const param = ctx.match[1];
    const nodeId = param === 'root' ? null : parseInt(param);

    await ctx.answerCbQuery(); // Stop loading animation
    await sendNode(ctx, nodeId);
});

// Handling Language Selection (if you have separate command for it)
bot.command('lang', async (ctx) => {
    await ctx.reply('Zəhmət olmasa dil seçin / Пожалуйста, выберите язык:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🇦🇿 Azərbaycan dili', callback_data: 'setlang:az' },
                    { text: '🇷🇺 Русский язык', callback_data: 'setlang:ru' }
                ]
            ]
        }
    });
});

bot.action('setlang:az', async (ctx) => {
    const user = await getOrCreateUser(ctx);
    await prisma.user.update({ where: { id: user.id }, data: { language: 'az' } });
    await ctx.answerCbQuery('Azərbaycan dili seçildi.');
    await sendNode(ctx, null);
});

bot.action('setlang:ru', async (ctx) => {
    const user = await getOrCreateUser(ctx);
    await prisma.user.update({ where: { id: user.id }, data: { language: 'ru' } });
    await ctx.answerCbQuery('Выбран русский язык.');
    await sendNode(ctx, null);
});

bot.on('text', async (ctx) => {
    // Just echo or ignore for now, this is a button-driven bot
    // Or maybe search?
});

// Log errors
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});
