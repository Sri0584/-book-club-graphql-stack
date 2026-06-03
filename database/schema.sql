-- Reference SQL equivalent for the Prisma PostgreSQL schema. The canonical model lives in server/prisma/schema.prisma.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS chat_messages, ratings, reviews, books, users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL CHECK (length(name) BETWEEN 2 AND 120),
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(240) NOT NULL CHECK (length(title) BETWEEN 1 AND 240),
  author VARCHAR(180) NOT NULL CHECK (length(author) BETWEEN 1 AND 180),
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  genre VARCHAR(80) NOT NULL DEFAULT 'General' CHECK (length(genre) BETWEEN 1 AND 80),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  body VARCHAR(2000) NOT NULL CHECK (length(body) BETWEEN 5 AND 2000),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (book_id, user_id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  message VARCHAR(1000) NOT NULL CHECK (length(message) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_created_id ON books (created_at DESC, id DESC);
CREATE INDEX idx_reviews_book_created_id ON reviews (book_id, created_at DESC, id DESC);
CREATE INDEX idx_chat_book_created_id ON chat_messages (book_id, created_at DESC, id DESC);
CREATE INDEX idx_ratings_book ON ratings (book_id);
