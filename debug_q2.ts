import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const q2 = await prisma.question.findUnique({
        where: { id: 2 }
    });
    console.log('Question 2:', q2);
    if (q2 && q2.attachment) {
        console.log('Attachment JSON:', JSON.parse(q2.attachment));
    } else {
        console.log('No attachment for Q2');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
