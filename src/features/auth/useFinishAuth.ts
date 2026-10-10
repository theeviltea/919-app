import { router } from 'expo-router';

import { useSession, type Role } from '@/data/session';

/** Signs the user in and returns them to the action that triggered auth (or home). */
export function useFinishAuth() {
  const { signIn, returnTo, pendingRole, setReturn } = useSession();
  return (data: { role?: Role; phone?: string; email?: string; firstName?: string } = {}) => {
    signIn({ id: 'me', role: data.role ?? pendingRole ?? 'seeker', phone: data.phone, email: data.email, firstName: data.firstName });
    const to = returnTo ?? '/home';
    setReturn(null);
    router.dismissAll();
    router.replace(to as never);
  };
}
