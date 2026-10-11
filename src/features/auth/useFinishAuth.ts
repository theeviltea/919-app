import { router } from 'expo-router';

import { demoDraft } from '@/data/seeker';
import { useSession, type CompanyStatus, type Role } from '@/data/session';
import { useSignup } from '@/data/signup';

/** Signs the user in and returns them to the action that triggered auth (or home). */
export function useFinishAuth() {
  const { signIn, returnTo, pendingRole, setReturn } = useSession();
  const { seeker, setSeeker } = useSignup();
  return (data: { role?: Role; phone?: string; email?: string; firstName?: string; company?: { name: string; status: CompanyStatus } } = {}) => {
    const role = data.role ?? pendingRole ?? 'seeker';
    // Signing in (not registering) as a seeker opens the demo account.
    if (role === 'seeker' && !seeker.firstName) setSeeker(demoDraft);
    signIn({ id: 'me', role, phone: data.phone, email: data.email, firstName: data.firstName, company: data.company });
    // A guest action of the other role (e.g. Respond while signing in as an employer) doesn't apply.
    const home = role === 'seeker' ? '/seeker' : '/hire';
    const to = returnTo && (!pendingRole || pendingRole === role) ? returnTo : home;
    setReturn(null);
    router.dismissAll();
    router.replace(to as never);
  };
}
