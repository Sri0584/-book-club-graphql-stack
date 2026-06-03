export type DecodedCursor = { createdAt: string; id: string };

export function encodeCursor(createdAt: Date | string, id: string) {
  const iso = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
  return Buffer.from(JSON.stringify({ createdAt: iso, id })).toString('base64url');
}

export function decodeCursor(cursor?: string | null): DecodedCursor | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as DecodedCursor;
    if (!parsed.createdAt || !parsed.id) return null;
    return parsed;
  } catch {
    throw new Error('Invalid pagination cursor.');
  }
}

export function normalizeLimit(first?: number | null, fallback = 10, max = 30) {
  if (first == null) return fallback;
  if (!Number.isInteger(first) || first < 1 || first > max) {
    throw new Error(`first must be an integer between 1 and ${max}.`);
  }
  return first;
}
