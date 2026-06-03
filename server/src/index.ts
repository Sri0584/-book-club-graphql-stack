import 'dotenv/config';
import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { buildContext, type GraphQLContext } from './graphql/context.js';
import { complexityRule } from './validation/complexity.js';
import { verifyToken } from './auth/jwt.js';
import { createLoaders } from './dataloaders/index.js';
import { prisma } from './db/prisma.js';

const port = Number(process.env.PORT ?? 4000);
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

const serverCleanup = useServer(
  {
    schema,
    context: async (ctx): Promise<GraphQLContext> => {
      const authorization = typeof ctx.connectionParams?.authorization === 'string' ? ctx.connectionParams.authorization : undefined;
      return {
        user: await verifyToken(authorization),
        loaders: createLoaders()
      };
    }
  },
  wsServer
);

const server = new ApolloServer<GraphQLContext>({
  schema,
  validationRules: [complexityRule(schema)],
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
            await prisma.$disconnect();
          }
        };
      }
    }
  ],
  formatError(formattedError) {
    return {
      ...formattedError,
      message: formattedError.message
    };
  }
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => buildContext(req)
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

httpServer.listen(port, () => {
  console.log(`Book club GraphQL API ready at http://localhost:${port}/graphql`);
});
