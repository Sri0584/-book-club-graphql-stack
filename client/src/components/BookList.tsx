import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { BOOKS_QUERY } from '../graphql/queries';
import { DiscussionChat } from './DiscussionChat';

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  averageRating: number | null;
  owner: { name: string };
  reviews: { edges: { node: { id: string; body: string; user: { name: string } } }[] };
};

type BooksData = {
  books: {
    edges: { cursor: string; node: Book }[];
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
  };
  recommendations?: Book[];
};

export function BookList() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data, loading, error, fetchMore } = useQuery<BooksData>(BOOKS_QUERY, {
    variables: { first: 6, after: null, search: null },
    notifyOnNetworkStatusChange: true
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !data?.books.pageInfo.hasNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void fetchMore({ variables: { after: data.books.pageInfo.endCursor } });
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [data?.books.pageInfo.endCursor, data?.books.pageInfo.hasNextPage, fetchMore]);

  if (error) return <p className="error">{error.message}</p>;

  const books = data?.books.edges.map((edge) => edge.node) ?? [];
  const activeBook = books.find((book) => book.id === activeBookId) ?? books[0];

  return (
    <section className="grid-layout">
      <div>
        <div className="section-header">
          <h2>Current club reads</h2>
          {loading ? <span>Loading…</span> : null}
        </div>
        <div className="book-grid">
          {books.map((book) => (
            <article key={book.id} className="book-card" onClick={() => setActiveBookId(book.id)}>
              <p className="eyebrow">{book.genre}</p>
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <p>{book.description}</p>
              <strong>{book.averageRating ? `${book.averageRating.toFixed(1)} ★` : 'No ratings yet'}</strong>
              <small>Added by {book.owner.name}</small>
              <div className="reviews">
                {book.reviews.edges.map(({ node }) => (
                  <blockquote key={node.id}>{node.body} — {node.user.name}</blockquote>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div ref={loadMoreRef} className="load-more">
          {data?.books.pageInfo.hasNextPage ? 'Scroll for more books…' : 'You reached the end.'}
        </div>
      </div>

      <aside>
        {activeBook ? <DiscussionChat bookId={activeBook.id} title={activeBook.title} /> : null}
        <div className="recommendations">
          <h2>Lazy recommendations</h2>
          <p className="hint">Loaded through a deferred GraphQL fragment when the server supports incremental delivery.</p>
          {(data?.recommendations ?? []).map((book) => (
            <div key={book.id} className="recommendation">
              <strong>{book.title}</strong>
              <span>{book.author}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
