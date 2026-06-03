# Book Club GraphQL Stack

A full-stack book club platform using React, Apollo Client, Node.js, Apollo Server, Prisma, and PostgreSQL.

## Features

- Complex nested GraphQL queries for `users -> books -> reviews -> ratings`
- Cursor-based pagination for books, reviews, and discussion chat
- GraphQL subscriptions for real-time discussion chat
- JWT authentication and ownership-aware mutations
- GraphQL validation and query complexity protection
- Prisma Client database access backed by PostgreSQL
- GraphQL Code Generator types for server resolvers and client operations
- DataLoaders to avoid N+1 database queries
- Frontend GraphQL fragment reuse
- `@defer` usage for lazy-loading recommendations from the client query

## Project layout

```text
book-club-platform/
├── client/             # React + Apollo Client app
├── server/             # Apollo Server + Prisma + PostgreSQL API
│   └── prisma/         # Prisma schema and seed script
└── database/           # SQL equivalent/reference schema and seed data
```

## Getting started

1. Configure the server:

   ```bash
   cp server/.env.example server/.env
   ```

2. Create the PostgreSQL database and apply the Prisma schema:

   ```bash
   createdb book_club
   npm install
   npm run prisma:migrate -w server
   npm run prisma:seed -w server
   ```

3. Run both apps:

   ```bash
   npm run dev
   ```

- API: <http://localhost:4000/graphql>
- Client: <http://localhost:5173>

Seeded users can sign in from the React auth panel with password `password123` (for example `ada@example.com`). The client stores the returned JWT in `localStorage` as `bookClubToken` before sending protected chat mutations.

## Prisma workflow

- The canonical database model lives in `server/prisma/schema.prisma`.
- Generate Prisma Client after dependency changes with `npm run prisma:generate -w server`.
- Use `npm run prisma:migrate -w server` for local migrations and `npm run prisma:seed -w server` to load sample book club data.

## GraphQL type generation

- Server resolver types are generated from `server/src/graphql/schema.ts` into `server/src/graphql/generated.ts`.
- Client operation and fragment types are generated from `client/src/graphql/**/*` into `client/src/graphql/generated.ts`.
- Run `npm run codegen` after schema or operation changes so TypeScript stays aligned with GraphQL.
