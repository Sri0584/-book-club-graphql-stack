import { gql } from '@apollo/client';
import { BOOK_FRAGMENT, REVIEW_FRAGMENT, CHAT_MESSAGE_FRAGMENT } from './fragments';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_BOOK_MUTATION = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      ...BookFields
    }
  }
  ${BOOK_FRAGMENT}
`;

export const ADD_REVIEW_MUTATION = gql`
  mutation AddReview($input: AddReviewInput!) {
    addReview(input: $input) {
      ...ReviewFields
    }
  }
  ${REVIEW_FRAGMENT}
`;

export const SEND_CHAT_MESSAGE_MUTATION = gql`
  mutation SendChatMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      ...ChatMessageFields
    }
  }
  ${CHAT_MESSAGE_FRAGMENT}
`;
