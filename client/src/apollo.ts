import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpUri = import.meta.env.VITE_GRAPHQL_HTTP_URL ?? 'http://localhost:4000/graphql';
const wsUri = import.meta.env.VITE_GRAPHQL_WS_URL ?? 'ws://localhost:4000/graphql';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('bookClubToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : undefined
    }
  };
});

const httpLink = new HttpLink({ uri: httpUri });

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => {
      const token = localStorage.getItem('bookClubToken');
      return token ? { authorization: `Bearer ${token}` } : {};
    }
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          books: {
            keyArgs: ['search'],
            merge(existing = { edges: [] }, incoming) {
              return { ...incoming, edges: [...existing.edges, ...incoming.edges] };
            }
          },
          chatMessages: {
            keyArgs: ['bookId'],
            merge(existing = { edges: [] }, incoming) {
              const existingIds = new Set(existing.edges.map((edge: { node: { id: string } }) => edge.node.id));
              return { ...incoming, edges: [...existing.edges, ...incoming.edges.filter((edge: { node: { id: string } }) => !existingIds.has(edge.node.id))] };
            }
          }
        }
      }
    }
  })
});
