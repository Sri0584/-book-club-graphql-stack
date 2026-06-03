import { FormEvent, useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations';
import type { LoginMutation, LoginMutationVariables, RegisterMutation, RegisterMutationVariables } from '../graphql/generated';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

const TOKEN_STORAGE_KEY = 'bookClubToken';
const USER_STORAGE_KEY = 'bookClubUser';

export function getStoredAuthUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function storeAuthSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

type AuthPanelProps = {
  user: AuthUser | null;
  onAuthChange: (user: AuthUser | null) => void;
};

export function AuthPanel({ user, onAuthChange }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Reader');
  const [email, setEmail] = useState('ada@example.com');
  const [password, setPassword] = useState('password123');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [login, loginState] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION);
  const [register, registerState] = useMutation<RegisterMutation, RegisterMutationVariables>(REGISTER_MUTATION);
  const loading = loginState.loading || registerState.loading;
  const error = loginState.error ?? registerState.error;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    const result =
      mode === 'login'
        ? await login({ variables: { input: { email, password } } })
        : await register({ variables: { input: { name, email, password } } });
    const payload = mode === 'login' ? result.data?.login : result.data?.register;
    if (!payload) return;
    storeAuthSession(payload.token, payload.user);
    onAuthChange(payload.user);
    setFeedback(`Signed in as ${payload.user.name}. You can now send chat messages.`);
  }

  function handleLogout() {
    clearAuthSession();
    onAuthChange(null);
    setFeedback('Signed out. Sign in again to send chat messages.');
  }

  if (user) {
    return (
      <div className="auth-panel signed-in">
        <div>
          <p className="eyebrow">Signed in</p>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <button type="button" onClick={handleLogout}>Sign out</button>
      </div>
    );
  }

  return (
    <form className="auth-panel" onSubmit={handleSubmit}>
      <div className="auth-mode-toggle" role="group" aria-label="Authentication mode">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>
      {mode === 'register' ? (
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required />
        </label>
      ) : null}
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Working…' : mode === 'login' ? 'Sign in for chat' : 'Create account'}</button>
      {error ? <p className="error">{error.message}</p> : null}
      {feedback ? <p className="hint">{feedback}</p> : null}
    </form>
  );
}
