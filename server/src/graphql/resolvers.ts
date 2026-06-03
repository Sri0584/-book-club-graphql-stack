import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import { PubSub, withFilter } from 'graphql-subscriptions';
import type { Book, ChatMessage, Prisma, Rating, Review, User } from '@prisma/client';
import { comparePassword, hashPassword, requireUser, signToken } from '../auth/jwt.js';
import { prisma } from '../db/prisma.js';
import { decodeCursor, encodeCursor, normalizeLimit } from './cursor.js';
import type { GraphQLContext } from './context.js';
import type { CursorArgs } from './types.js';

const pubsub = new PubSub();
const CHAT_MESSAGE_ADDED = 'CHAT_MESSAGE_ADDED';

type ChatPayload = { chatMessageAdded: ChatMessage };
type CursorNode = { id: string; createdAt: Date };

function assertLength(value: string, field: string, min: number, max: number) {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new GraphQLError(`${field} must be between ${min} and ${max} characters.`, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
  return trimmed;
}

function assertScore(score?: number | null) {
  if (score != null && (!Number.isInteger(score) || score < 1 || score > 5)) {
    throw new GraphQLError('score must be an integer between 1 and 5.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
}

function connection<T extends CursorNode>(rows: T[], limit: number) {
  const visibleRows = rows.slice(0, limit);
  return {
    edges: visibleRows.map((node) => ({ node, cursor: encodeCursor(node.createdAt, node.id) })),
    pageInfo: {
      endCursor: visibleRows.length ? encodeCursor(visibleRows[visibleRows.length - 1].createdAt, visibleRows[visibleRows.length - 1].id) : null,
      hasNextPage: rows.length > limit
    }
  };
}

function cursorWhere(after?: string | null) {
  const cursor = decodeCursor(after);
  if (!cursor) return undefined;
  const createdAt = new Date(cursor.createdAt);
  return {
    OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: cursor.id } }]
  };
}

async function bookConnection(args: CursorArgs & { search?: string | null }) {
  const limit = normalizeLimit(args.first, 10, 30);
  const search = args.search?.trim();
  const where: Prisma.BookWhereInput = {
    AND: [
      cursorWhere(args.after),
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
              { genre: { contains: search, mode: 'insensitive' } }
            ]
          }
        : undefined
    ].filter(Boolean) as Prisma.BookWhereInput[]
  };
  const rows = await prisma.book.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1
  });
  return connection(rows, limit);
}

async function reviewConnection(bookId: string, args: CursorArgs) {
  const limit = normalizeLimit(args.first, 10, 30);
  const rows = await prisma.review.findMany({
    where: { AND: [{ bookId }, cursorWhere(args.after)].filter(Boolean) as Prisma.ReviewWhereInput[] },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1
  });
  return connection(rows, limit);
}

async function chatMessageConnection(bookId: string, args: CursorArgs) {
  const limit = normalizeLimit(args.first, 20, 50);
  const rows = await prisma.chatMessage.findMany({
    where: { AND: [{ bookId }, cursorWhere(args.after)].filter(Boolean) as Prisma.ChatMessageWhereInput[] },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1
  });
  return connection(rows, limit);
}

async function recommendedBooks(user: User | null, limit?: number) {
  const safeLimit = normalizeLimit(limit, 5, 10);
  const excludedBookIds = user
    ? (await prisma.rating.findMany({ where: { userId: user.id }, select: { bookId: true } })).map((rating) => rating.bookId)
    : [];

  const highlyRated = await prisma.rating.groupBy({
    by: ['bookId'],
    where: excludedBookIds.length ? { bookId: { notIn: excludedBookIds } } : undefined,
    _avg: { score: true },
    orderBy: { _avg: { score: 'desc' } },
    take: safeLimit * 4
  });

  const rankedIds = highlyRated.map((rating) => rating.bookId);
  const rankedBooks = rankedIds.length ? await prisma.book.findMany({ where: { id: { in: rankedIds } } }) : [];
  const byId = new Map(rankedBooks.map((book) => [book.id, book]));
  const recommendations = rankedIds.map((id) => byId.get(id)).filter((book): book is Book => Boolean(book));

  if (recommendations.length < safeLimit) {
    const recent = await prisma.book.findMany({
      where: { id: { notIn: [...excludedBookIds, ...recommendations.map((book) => book.id)] } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: safeLimit - recommendations.length
    });
    recommendations.push(...recent);
  }

  return recommendations.slice(0, safeLimit);
}

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    serialize(value) {
      return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
    },
    parseValue(value) {
      return new Date(String(value));
    },
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? new Date(ast.value) : null;
    }
  }),

  Query: {
    me: (_: unknown, __: unknown, context: GraphQLContext) => context.user,
    users: async () => prisma.user.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
    book: async (_: unknown, { id }: { id: string }) => prisma.book.findUnique({ where: { id } }),
    books: async (_: unknown, args: CursorArgs & { search?: string | null }) => bookConnection(args),
    recommendations: async (_: unknown, { limit = 5 }: { limit?: number }, context: GraphQLContext) => recommendedBooks(context.user, limit),
    chatMessages: async (_: unknown, args: CursorArgs & { bookId: string }) => chatMessageConnection(args.bookId, args)
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: { name: string; email: string; password: string } }) => {
      const name = assertLength(input.name, 'name', 2, 120);
      const email = input.email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new GraphQLError('Invalid email address.', { extensions: { code: 'BAD_USER_INPUT' } });
      const password = assertLength(input.password, 'password', 8, 128);
      const passwordHash = await hashPassword(password);
      try {
        const user = await prisma.user.create({ data: { name, email, passwordHash } });
        return { token: await signToken(user), user };
      } catch {
        throw new GraphQLError('Email is already registered.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
    },
    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
      if (!user || !(await comparePassword(input.password, user.passwordHash))) {
        throw new GraphQLError('Invalid credentials.', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      return { token: await signToken(user), user };
    },
    createBook: async (_: unknown, { input }: { input: { title: string; author: string; description: string; coverUrl?: string; genre: string } }, context: GraphQLContext) => {
      const user = requireUser(context.user);
      return prisma.book.create({
        data: {
          ownerId: user.id,
          title: assertLength(input.title, 'title', 1, 240),
          author: assertLength(input.author, 'author', 1, 180),
          description: input.description.trim(),
          coverUrl: input.coverUrl ?? null,
          genre: assertLength(input.genre, 'genre', 1, 80)
        }
      });
    },
    addReview: async (_: unknown, { input }: { input: { bookId: string; body: string; score?: number } }, context: GraphQLContext) => {
      const user = requireUser(context.user);
      assertScore(input.score);
      try {
        const review = await prisma.review.create({
          data: { bookId: input.bookId, userId: user.id, body: assertLength(input.body, 'body', 5, 2000) }
        });
        if (input.score != null) {
          await prisma.rating.upsert({
            where: { bookId_userId: { bookId: input.bookId, userId: user.id } },
            update: { score: input.score },
            create: { bookId: input.bookId, userId: user.id, score: input.score }
          });
        }
        return review;
      } catch {
        throw new GraphQLError('Unable to add review for the requested book.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
    },
    sendChatMessage: async (_: unknown, { input }: { input: { bookId: string; message: string } }, context: GraphQLContext) => {
      const user = requireUser(context.user);
      try {
        const chatMessage = await prisma.chatMessage.create({
          data: { bookId: input.bookId, userId: user.id, message: assertLength(input.message, 'message', 1, 1000) }
        });
        await pubsub.publish(CHAT_MESSAGE_ADDED, { chatMessageAdded: chatMessage });
        return chatMessage;
      } catch {
        throw new GraphQLError('Unable to send chat message for the requested book.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
    }
  },

  Subscription: {
    chatMessageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(CHAT_MESSAGE_ADDED),
        (payload: ChatPayload, variables: { bookId: string }) => payload.chatMessageAdded.bookId === variables.bookId
      )
    }
  },

  User: {
    createdAt: (user: User) => user.createdAt,
    books: (user: User, _: unknown, context: GraphQLContext) => context.loaders.booksByOwnerId.load(user.id)
  },

  Book: {
    createdAt: (book: Book) => book.createdAt,
    owner: async (book: Book, _: unknown, context: GraphQLContext) => context.loaders.usersById.load(book.ownerId),
    reviews: async (book: Book, args: CursorArgs) => reviewConnection(book.id, args),
    ratings: (book: Book, _: unknown, context: GraphQLContext) => context.loaders.ratingsByBookId.load(book.id),
    averageRating: async (book: Book, _: unknown, context: GraphQLContext) => {
      const ratings = await context.loaders.ratingsByBookId.load(book.id);
      return ratings.length ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length : null;
    }
  },

  Review: {
    createdAt: (review: Review) => review.createdAt,
    user: (review: Review, _: unknown, context: GraphQLContext) => context.loaders.usersById.load(review.userId),
    book: (review: Review, _: unknown, context: GraphQLContext) => context.loaders.booksById.load(review.bookId)
  },

  Rating: {
    createdAt: (rating: Rating) => rating.createdAt,
    user: (rating: Rating, _: unknown, context: GraphQLContext) => context.loaders.usersById.load(rating.userId),
    book: (rating: Rating, _: unknown, context: GraphQLContext) => context.loaders.booksById.load(rating.bookId)
  },

  ChatMessage: {
    createdAt: (message: ChatMessage) => message.createdAt,
    user: (message: ChatMessage, _: unknown, context: GraphQLContext) => context.loaders.usersById.load(message.userId),
    book: (message: ChatMessage, _: unknown, context: GraphQLContext) => context.loaders.booksById.load(message.bookId)
  }
};
