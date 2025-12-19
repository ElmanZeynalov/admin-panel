import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const questions = await prisma.question.findMany({
        include: { buttons: true },
        orderBy: { id: 'asc' }
    });
    console.log('--- All Questions ---');
    console.dir(questions, { depth: null });

    const user = await prisma.user.findFirst({
        where: { username: 'ZeynalovElman' } // Adjust if username is different or use findMany
    });
    console.log('--- User State ---');
    console.log(user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
