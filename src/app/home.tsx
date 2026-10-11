import { Redirect } from 'expo-router';

import { useSession } from '@/data/session';

/** Old landing after sign-in: each role has its own app now. */
export default function Home() {
  const { user } = useSession();
  return <Redirect href={!user ? '/guest' : user.role === 'employer' ? '/hire' : '/seeker'} />;
}
