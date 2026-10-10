import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Role = 'seeker' | 'employer';

type User = { id: string; role: Role; phone?: string; email?: string; firstName?: string };

type Session = {
  user: User | null;
  /** Where to return after sign-in (e.g. the vacancy a guest tried to respond to). */
  returnTo: string | null;
  /** Role the next new account gets — set by the guest action that triggered sign-up. */
  pendingRole: Role | null;
  setReturn: (path: string | null, role?: Role | null) => void;
  signIn: (u: User) => void;
  signOut: () => void;
};

const Ctx = createContext<Session | null>(null);

/** Prototype session. Replaced by the real auth client (tokens, refresh) once the backend exists. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const value = useMemo<Session>(
    () => ({
      user,
      returnTo,
      pendingRole,
      setReturn: (path, role = null) => {
        setReturnTo(path);
        setPendingRole(role);
      },
      signIn: (u) => setUser(u),
      signOut: () => setUser(null),
    }),
    [user, returnTo, pendingRole],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}
