import { router } from 'expo-router';

import { useSession } from '@/data/session';
import { useSignup } from '@/data/signup';
import { formatPhone } from './PhoneInput';

/**
 * "Create account": the role comes first (Who are you here as?), then phone / Apple / Google / email.
 * Skips the role screen when a guest action already defined it (e.g. Apply → seeker).
 */
export function useCreateAccount() {
  const { pendingRole } = useSession();
  return (mode: 'push' | 'replace' = 'push') => router[mode](pendingRole ? '/auth/register' : '/auth/role');
}

/** After the contact is confirmed (code / social): continue with the sign-up of the chosen role. */
export function useAfterContact() {
  const { pendingRole } = useSession();
  const { setEmployer } = useSignup();
  return (params: { phone?: string; email?: string; social?: string }) => {
    if (pendingRole === 'employer') {
      // The phone is locked on the representative step, the email prefills it.
      const [dial, digits] = (params.phone ?? '').split('|');
      setEmployer({ phone: digits ? `${dial} ${formatPhone(digits, dial)}` : '', phoneLocked: !!digits, email: params.email ?? '' });
      router.replace('/employer/type');
    } else router.replace({ pathname: '/auth/about', params });
  };
}
