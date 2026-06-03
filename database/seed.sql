-- Reference SQL equivalent for the Prisma PostgreSQL schema. The canonical model lives in server/prisma/schema.prisma.
INSERT INTO users (id, name, email, password_hash, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Ada Lovelace', 'ada@example.com', '$2b$10$3kMdi6k4KQZ1bn56ZVxMZ.Jcl0dbqRdAbYz7BPYxB3hRb1SdJQkPu', 'https://i.pravatar.cc/120?img=1'),
('00000000-0000-0000-0000-000000000002', 'Octavia Butler', 'octavia@example.com', '$2b$10$3kMdi6k4KQZ1bn56ZVxMZ.Jcl0dbqRdAbYz7BPYxB3hRb1SdJQkPu', 'https://i.pravatar.cc/120?img=2'),
('00000000-0000-0000-0000-000000000003', 'Ursula Le Guin', 'ursula@example.com', '$2b$10$3kMdi6k4KQZ1bn56ZVxMZ.Jcl0dbqRdAbYz7BPYxB3hRb1SdJQkPu', 'https://i.pravatar.cc/120?img=3');

INSERT INTO books (id, owner_id, title, author, description, genre) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'The Left Hand of Darkness', 'Ursula K. Le Guin', 'A landmark science-fiction novel for thoughtful discussion.', 'Science Fiction'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Kindred', 'Octavia E. Butler', 'A genre-defying classic about memory, history, and power.', 'Speculative Fiction'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'A contemporary novel about creative partnership.', 'Literary Fiction');

INSERT INTO reviews (book_id, user_id, body) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Rich world-building and one of our best club discussions.'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'The shifting perspective gave everyone something to debate.'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Essential reading and deeply affecting.');

INSERT INTO ratings (book_id, user_id, score) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 4),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 5),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 5);

INSERT INTO chat_messages (book_id, user_id, message) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'What theme should we open with tonight?'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'I vote for identity and belonging.');
