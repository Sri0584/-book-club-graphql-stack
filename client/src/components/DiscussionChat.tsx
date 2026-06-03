import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CHAT_MESSAGES_QUERY } from '../graphql/queries';
import { SEND_CHAT_MESSAGE_MUTATION } from '../graphql/mutations';
import { CHAT_MESSAGE_ADDED_SUBSCRIPTION } from '../graphql/subscriptions';

type ChatMessage = {
  id: string;
  message: string;
  createdAt: string;
  user: { name: string };
};

type ChatData = {
  chatMessages: {
    edges: { cursor: string; node: ChatMessage }[];
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
  };
};

export function DiscussionChat({ bookId, title }: { bookId: string; title: string }) {
  const [message, setMessage] = useState('');
  const { data, error, subscribeToMore } = useQuery<ChatData>(CHAT_MESSAGES_QUERY, {
    variables: { bookId, first: 20, after: null }
  });
  const [sendChatMessage, { loading }] = useMutation(SEND_CHAT_MESSAGE_MUTATION);

  useEffect(() => {
    return subscribeToMore({
      document: CHAT_MESSAGE_ADDED_SUBSCRIPTION,
      variables: { bookId },
      updateQuery(previous, { subscriptionData }) {
        const node = subscriptionData.data?.chatMessageAdded;
        if (!node || previous.chatMessages.edges.some((edge) => edge.node.id === node.id)) return previous;
        return {
          chatMessages: {
            ...previous.chatMessages,
            edges: [{ cursor: node.createdAt, node }, ...previous.chatMessages.edges]
          }
        };
      }
    });
  }, [bookId, subscribeToMore]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    await sendChatMessage({ variables: { input: { bookId, message: message.trim() } } });
    setMessage('');
  }

  return (
    <div className="chat-panel">
      <h2>Live chat</h2>
      <p className="hint">Discussing {title}</p>
      {error ? <p className="error">{error.message}</p> : null}
      <div className="messages">
        {(data?.chatMessages.edges ?? []).map(({ node }) => (
          <div key={node.id} className="message">
            <strong>{node.user.name}</strong>
            <span>{node.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Send a discussion message" />
        <button disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
      </form>
    </div>
  );
}
