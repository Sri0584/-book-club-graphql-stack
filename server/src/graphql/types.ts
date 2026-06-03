import type { Book, ChatMessage, Rating, Review, User } from '@prisma/client';

export type UserModel = User;
export type BookModel = Book;
export type ReviewModel = Review;
export type RatingModel = Rating;
export type ChatMessageModel = ChatMessage;

export type CursorArgs = {
  first?: number | null;
  after?: string | null;
};
