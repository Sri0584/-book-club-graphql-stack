CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "avatar_url" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_name_length_check" CHECK (length("name") BETWEEN 2 AND 120)
);

CREATE TABLE "books" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" UUID NOT NULL,
  "title" VARCHAR(240) NOT NULL,
  "author" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "cover_url" TEXT,
  "genre" VARCHAR(80) NOT NULL DEFAULT 'General',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "books_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "books_title_length_check" CHECK (length("title") BETWEEN 1 AND 240),
  CONSTRAINT "books_author_length_check" CHECK (length("author") BETWEEN 1 AND 180),
  CONSTRAINT "books_genre_length_check" CHECK (length("genre") BETWEEN 1 AND 80)
);

CREATE TABLE "reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "book_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "body" VARCHAR(2000) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reviews_body_length_check" CHECK (length("body") BETWEEN 5 AND 2000)
);

CREATE TABLE "ratings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "book_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "score" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ratings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ratings_score_check" CHECK ("score" BETWEEN 1 AND 5)
);

CREATE TABLE "chat_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "book_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "message" VARCHAR(1000) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "chat_messages_message_length_check" CHECK (length("message") BETWEEN 1 AND 1000)
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "ratings_bookId_userId_key" ON "ratings"("book_id", "user_id");
CREATE INDEX "idx_books_created_id" ON "books"("created_at" DESC, "id" DESC);
CREATE INDEX "idx_reviews_book_created_id" ON "reviews"("book_id", "created_at" DESC, "id" DESC);
CREATE INDEX "idx_chat_book_created_id" ON "chat_messages"("book_id", "created_at" DESC, "id" DESC);
CREATE INDEX "idx_ratings_book" ON "ratings"("book_id");

ALTER TABLE "books" ADD CONSTRAINT "books_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
