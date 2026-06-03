import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import type { User } from '@prisma/client';
import { prisma } from '../db/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'development-secret-change-me';

type JwtPayload = { sub: string; email: string };

export async function signToken(user: Pick<User, 'id' | 'email'>) {
  return jwt.sign({ sub: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token?: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token.replace(/^Bearer\s+/i, ''), JWT_SECRET) as JwtPayload;
    return prisma.user.findUnique({ where: { id: decoded.sub } });
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function requireUser(user: User | null) {
  if (!user) {
    throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return user;
}
