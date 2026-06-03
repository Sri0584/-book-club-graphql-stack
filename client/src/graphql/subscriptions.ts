import { gql } from '@apollo/client';
import { CHAT_MESSAGE_FRAGMENT } from './fragments';

export const CHAT_MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription ChatMessageAdded($bookId: ID!) {
    chatMessageAdded(bookId: $bookId) {
      ...ChatMessageFields
    }
  }
  ${CHAT_MESSAGE_FRAGMENT}
`;
