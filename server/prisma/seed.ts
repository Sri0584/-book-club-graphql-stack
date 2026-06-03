import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.chatMessage.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        passwordHash,
        avatarUrl: 'https://i.pravatar.cc/120?img=1'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Octavia Butler',
        email: 'octavia@example.com',
        passwordHash,
        avatarUrl: 'https://i.pravatar.cc/120?img=2'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Ursula Le Guin',
        email: 'ursula@example.com',
        passwordHash,
        avatarUrl: 'https://i.pravatar.cc/120?img=3'
      }
    ]
  });

  await prisma.book.createMany({
    data: [
      {
        id: '10000000-0000-0000-0000-000000000001',
        ownerId: '00000000-0000-0000-0000-000000000001',
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
        description: 'A landmark science-fiction novel for thoughtful discussion.',
        genre: 'Science Fiction'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        ownerId: '00000000-0000-0000-0000-000000000002',
        title: 'Kindred',
        author: 'Octavia E. Butler',
        description: 'A genre-defying classic about memory, history, and power.',
        genre: 'Speculative Fiction'
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        ownerId: '00000000-0000-0000-0000-000000000003',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        description: 'A contemporary novel about creative partnership.',
        genre: 'Literary Fiction'
      }
    ]
  });

  await prisma.review.createMany({
    data: [
      {
        bookId: '10000000-0000-0000-0000-000000000001',
        userId: '00000000-0000-0000-0000-000000000002',
        body: 'Rich world-building and one of our best club discussions.'
      },
      {
        bookId: '10000000-0000-0000-0000-000000000001',
        userId: '00000000-0000-0000-0000-000000000003',
        body: 'The shifting perspective gave everyone something to debate.'
      },
      {
        bookId: '10000000-0000-0000-0000-000000000002',
        userId: '00000000-0000-0000-0000-000000000001',
        body: 'Essential reading and deeply affecting.'
      }
    ]
  });

  await prisma.rating.createMany({
    data: [
      { bookId: '10000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000001', score: 5 },
      { bookId: '10000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000002', score: 5 },
      { bookId: '10000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000003', score: 4 },
      { bookId: '10000000-0000-0000-0000-000000000002', userId: '00000000-0000-0000-0000-000000000001', score: 5 },
      { bookId: '10000000-0000-0000-0000-000000000002', userId: '00000000-0000-0000-0000-000000000003', score: 5 }
    ]
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        bookId: '10000000-0000-0000-0000-000000000001',
        userId: '00000000-0000-0000-0000-000000000001',
        message: 'What theme should we open with tonight?'
      },
      {
        bookId: '10000000-0000-0000-0000-000000000001',
        userId: '00000000-0000-0000-0000-000000000002',
        message: 'I vote for identity and belonging.'
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
