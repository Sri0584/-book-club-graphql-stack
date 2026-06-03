import { gql } from "@apollo/client";
import {
	BOOK_FRAGMENT,
	CHAT_MESSAGE_FRAGMENT,
	REVIEW_FRAGMENT,
} from "./fragments";

export const BOOKS_QUERY = gql`
	query Books($first: Int!, $after: String, $search: String) {
		books(first: $first, after: $after, search: $search) {
			edges {
				cursor
				node {
					...BookFields
					reviews(first: 2) {
						edges {
							node {
								...ReviewFields
							}
						}
					}
					ratings {
						id
						score
					}
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
	${BOOK_FRAGMENT}
	${REVIEW_FRAGMENT}
`;
export const CHAT_MESSAGES_QUERY = gql`
	query ChatMessages($bookId: ID!, $first: Int!, $after: String) {
		chatMessages(bookId: $bookId, first: $first, after: $after) {
			edges {
				cursor
				node {
					...ChatMessageFields
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
	${CHAT_MESSAGE_FRAGMENT}
`;
