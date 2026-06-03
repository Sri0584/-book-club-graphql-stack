import type { Request } from 'express';
import type { User } from '@prisma/client';
import { verifyToken } from '../auth/jwt.js';
import { createLoaders, type Loaders } from '../dataloaders/index.js';

export type GraphQLContext = {
  user: User | null;
  loaders: Loaders;
};

export async function buildContext(req?: Request): Promise<GraphQLContext> {
  const token = req?.headers.authorization;
  return {
    user: await verifyToken(token),
    loaders: createLoaders()
  };
}
