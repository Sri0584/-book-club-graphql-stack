import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo';
import { BookList } from './components/BookList';
import './styles.css';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <main className="app-shell">
        <header className="hero">
          <p className="eyebrow">GraphQL Book Club</p>
          <h1>Nested reads, live discussions, and thoughtful recommendations.</h1>
          <p>
            React and Apollo Client query nested club data, reuse fragments, paginate with cursors, subscribe to live chat,
            and request recommendations with <code>@defer</code>.
          </p>
        </header>
        <BookList />
      </main>
    </ApolloProvider>
  );
}
