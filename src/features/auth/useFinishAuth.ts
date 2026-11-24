import { router } from 'expo-router';

import { demoDraft } from '@/data/seeker';
import { useSession, type CompanyStatus, type Role } from '@/data/session';
import { useSignup } from '@/data/signup';

type Data = { role?: Role; phone?: string; email?: string; firstName?: string; company?: { name: string; status: CompanyStatus }; created?: boolean };

/**
 * Signs the user in and returns them to the action that triggered auth (or home).
 * During "Add account" the new account is added next to the current one and the app switches to it.
 */
export function useFinishAuth() {
  const { signIn, returnTo, pendingRole, setReturn, adding, user, accounts, switchTo } = useSession();
  const { seeker, setSeeker } = useSignup();
  return (data: Data = {}) => {
    const role = data.role ?? pendingRole ?? 'seeker';
    // Signing in (not registering) as a seeker opens the demo account.
    if (role === 'seeker' && !seeker.firstName) setSeeker(demoDraft);
    const id = data.created ? `acc-${Date.now()}` : 'me';
    const u = { id, role, phone: data.phone, email: data.email, firstName: data.firstName, company: data.company };
    if (adding && user && accounts.length) {
      const acc = signIn(u, { current: false });
      setReturn(null);
      if (acc.id === user.id) return;
      switchTo(acc.id);
      return;
    }
    signIn(u);
    // A guest action of the other role (e.g. Respond while signing in as an employer) doesn't apply.
    const home = role === 'seeker' ? '/seeker' : '/hire';
    const to = returnTo && (!pendingRole || pendingRole === role) ? returnTo : home;
    setReturn(null);
    router.dismissAll();
    router.replace(to as never);
  };
}
