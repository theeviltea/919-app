import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

export type Role = 'seeker' | 'employer';

export type CompanyStatus = 'pending' | 'approved' | 'none';
type User = { id: string; role: Role; phone?: string; email?: string; firstName?: string; company?: { name: string; status: CompanyStatus } };

/** A signed-in account kept on this phone. Each one has its own profile, chats and subscription. */
export type Account = User & {
  /** Person's name for a seeker, company name for an employer. */
  name: string;
  /** Second line under the name: the email for a seeker, the role in the company for an employer. */
  detail: string;
  photo?: ImageSourcePropType;
};

/** Up to 5 accounts on one phone (AccAdd). */
export const MAX_ACCOUNTS = 5;

const DEMO_SEEKER = { name: 'Mia Dakaskos', email: 'mia.dakaskos@gmail.com', photo: require('@/assets/images/mock/people/p1.jpg') as ImageSourcePropType };

/** Prototype identity: which account a sign-in lands on. A number of all 8s is the demo employer, anything else the demo seeker. */
export function accountIdFor(u: { role: Role; phone?: string; email?: string }) {
  if (u.role === 'employer') return 'emp-skyline';
  return 'seeker-mia';
}

function toAccount(u: User): Account {
  if (u.role === 'employer') {
    return { ...u, name: u.company?.name || 'Your company', detail: 'Recruiter' };
  }
  const demo = u.id === 'seeker-mia';
  return { ...u, name: demo ? DEMO_SEEKER.name : u.firstName || 'New account', detail: u.email ?? (demo ? DEMO_SEEKER.email : u.phone?.replace('|', ' ') ?? ''), photo: demo ? DEMO_SEEKER.photo : undefined };
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

type Session = {
  /** The account in use right now. */
  user: Account | null;
  /** Every account signed in on this phone, in the order they were added. */
  accounts: Account[];
  /** Where to return after sign-in (e.g. the vacancy a guest tried to respond to). */
  returnTo: string | null;
  /** Role the next new account gets — set by the guest action that triggered sign-up. */
  pendingRole: Role | null;
  setReturn: (path: string | null, role?: Role | null) => void;
  /** Role picked on the "Who are you here as?" screen at the start of sign-up. */
  setPendingRole: (role: Role | null) => void;
  /** Signs in and makes the account current (or only adds it, with `current: false`); an account already on the phone is reused. */
  signIn: (u: User, opts?: { current?: boolean }) => Account;
  /** Logs out of the current account or of all of them. With other accounts on the phone, logging out of one switches to the next. */
  signOut: (scope?: 'current' | 'all') => void;
  /** True while the user goes through "Add account": the sign-in that follows adds an account instead of replacing one. */
  adding: boolean;
  setAdding: (v: boolean) => void;
  /** The account the switching screen is moving to, and the one it's leaving. */
  switching: Account | null;
  switchingFrom: Account | null;
  /** Starts a switch: the full-screen "Switching to…" then the other account's home. */
  switchTo: (id: string) => void;
  /** Called by the switching screen when it's done. */
  finishSwitch: () => Account | null;
};

const Ctx = createContext<Session | null>(null);

/** Prototype session with several accounts on one phone. Replaced by the real auth client (tokens per account, refresh) once the backend exists. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [adding, setAdding] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [fromId, setFromId] = useState<string | null>(null);
  const [leaveId, setLeaveId] = useState<string | null>(null);

  const signIn = useCallback((u: User, opts?: { current?: boolean }) => {
    const id = u.id === 'me' ? accountIdFor(u) : u.id;
    const acc = toAccount({ ...u, id });
    setAccounts((xs) => (xs.some((x) => x.id === id) ? xs.map((x) => (x.id === id ? { ...x, ...acc, photo: acc.photo ?? x.photo } : x)) : [...xs, acc].slice(-MAX_ACCOUNTS)));
    if (opts?.current !== false) setCurrentId(id);
    return acc;
  }, []);

  const user = accounts.find((a) => a.id === currentId) ?? null;
  const switching = accounts.find((a) => a.id === switchingId) ?? null;
  const switchingFrom = accounts.find((a) => a.id === fromId) ?? null;

  const value = useMemo<Session>(
    () => ({
      user,
      accounts,
      returnTo,
      pendingRole,
      setReturn: (path, role = null) => {
        setReturnTo(path);
        setPendingRole(role);
      },
      setPendingRole,
      signIn,
      signOut: (scope = 'current') => {
        setAdding(false);
        if (scope === 'all') {
          setAccounts([]);
          setCurrentId(null);
          return;
        }
        const rest = accounts.filter((a) => a.id !== currentId);
        if (!rest.length) {
          setAccounts([]);
          setCurrentId(null);
          return;
        }
        // The account stays visible on the switching screen and is removed when the switch is done.
        setLeaveId(currentId);
        setFromId(currentId);
        setSwitchingId(rest[0]!.id);
      },
      adding,
      setAdding,
      switching,
      switchingFrom,
      switchTo: (id) => {
        setFromId(currentId);
        setSwitchingId(id);
      },
      finishSwitch: () => {
        const to = accounts.find((a) => a.id === switchingId) ?? null;
        if (to) setCurrentId(to.id);
        if (leaveId) setAccounts((xs) => xs.filter((a) => a.id !== leaveId));
        setLeaveId(null);
        setSwitchingId(null);
        // `adding` stays on: the code screen may submit once more while it's being dismissed, and that must not sign in again.
        return to;
      },
    }),
    [user, accounts, currentId, returnTo, pendingRole, signIn, adding, switching, switchingFrom, switchingId, leaveId],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}
