export const typeDefs = `#graphql
  directive @defer(if: Boolean = true, label: String) on FRAGMENT_SPREAD | INLINE_FRAGMENT

  scalar DateTime

  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String
    books: [Book!]!
    createdAt: DateTime!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    description: String!
    coverUrl: String
    genre: String!
    owner: User!
    reviews(first: Int = 10, after: String): ReviewConnection!
    ratings: [Rating!]!
    averageRating: Float
    createdAt: DateTime!
  }

  type Review {
    id: ID!
    body: String!
    book: Book!
    user: User!
    createdAt: DateTime!
  }

  type Rating {
    id: ID!
    score: Int!
    book: Book!
    user: User!
    createdAt: DateTime!
  }

  type ChatMessage {
    id: ID!
    message: String!
    book: Book!
    user: User!
    createdAt: DateTime!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type BookEdge {
    cursor: String!
    node: Book!
  }

  type BookConnection {
    edges: [BookEdge!]!
    pageInfo: PageInfo!
  }

  type ReviewEdge {
    cursor: String!
    node: Review!
  }

  type ReviewConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
  }

  type ChatMessageEdge {
    cursor: String!
    node: ChatMessage!
  }

  type ChatMessageConnection {
    edges: [ChatMessageEdge!]!
    pageInfo: PageInfo!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateBookInput {
    title: String!
    author: String!
    description: String!
    coverUrl: String
    genre: String!
  }

  input AddReviewInput {
    bookId: ID!
    body: String!
    score: Int
  }

  input SendChatMessageInput {
    bookId: ID!
    message: String!
  }

  type Query {
    me: User
    users: [User!]!
    book(id: ID!): Book
    books(first: Int = 10, after: String, search: String): BookConnection!
    recommendations(limit: Int = 5): [Book!]!
    chatMessages(bookId: ID!, first: Int = 20, after: String): ChatMessageConnection!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createBook(input: CreateBookInput!): Book!
    addReview(input: AddReviewInput!): Review!
    sendChatMessage(input: SendChatMessageInput!): ChatMessage!
  }

  type Subscription {
    chatMessageAdded(bookId: ID!): ChatMessage!
  }
`;
