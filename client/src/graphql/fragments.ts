import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    avatarUrl
  }
`;

export const RATING_FRAGMENT = gql`
  fragment RatingFields on Rating {
    id
    score
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const REVIEW_FRAGMENT = gql`
  fragment ReviewFields on Review {
    id
    body
    createdAt
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const BOOK_FRAGMENT = gql`
  fragment BookFields on Book {
    id
    title
    author
    description
    genre
    coverUrl
    averageRating
    owner {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const CHAT_MESSAGE_FRAGMENT = gql`
  fragment ChatMessageFields on ChatMessage {
    id
    message
    createdAt
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;
