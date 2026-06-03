import DataLoader from 'dataloader';
import type { Book, Rating, Review, User } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function groupBy<T, K extends string>(rows: T[], key: (row: T) => K) {
  const grouped = new Map<K, T[]>();
  for (const row of rows) {
    const groupKey = key(row);
    grouped.set(groupKey, [...(grouped.get(groupKey) ?? []), row]);
  }
  return grouped;
}

export function createLoaders() {
  return {
    usersById: new DataLoader<string, User | null>(async (ids) => {
      const users = await prisma.user.findMany({ where: { id: { in: [...ids] } } });
      const byId = new Map(users.map((user) => [user.id, user]));
      return ids.map((id) => byId.get(id) ?? null);
    }),
    booksByOwnerId: new DataLoader<string, Book[]>(async (ownerIds) => {
      const books = await prisma.book.findMany({
        where: { ownerId: { in: [...ownerIds] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
      });
      const grouped = groupBy(books, (book) => book.ownerId);
      return ownerIds.map((id) => grouped.get(id) ?? []);
    }),
    reviewsByBookId: new DataLoader<string, Review[]>(async (bookIds) => {
      const reviews = await prisma.review.findMany({
        where: { bookId: { in: [...bookIds] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
      });
      const grouped = groupBy(reviews, (review) => review.bookId);
      return bookIds.map((id) => grouped.get(id) ?? []);
    }),
    ratingsByBookId: new DataLoader<string, Rating[]>(async (bookIds) => {
      const ratings = await prisma.rating.findMany({ where: { bookId: { in: [...bookIds] } } });
      const grouped = groupBy(ratings, (rating) => rating.bookId);
      return bookIds.map((id) => grouped.get(id) ?? []);
    }),
    booksById: new DataLoader<string, Book | null>(async (ids) => {
      const books = await prisma.book.findMany({ where: { id: { in: [...ids] } } });
      const byId = new Map(books.map((book) => [book.id, book]));
      return ids.map((id) => byId.get(id) ?? null);
    })
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
