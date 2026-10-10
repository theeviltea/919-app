import { router } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo, Text, VectorPattern } from '@/components';
import { useSession } from '@/data/session';

/** Splash — vector pattern, big logo, tagline. Leads to the guest zone (or home when signed in). */
export default function Splash() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  useEffect(() => {
    const t = setTimeout(() => router.replace(user ? '/home' : '/guest'), 1400);
    return () => clearTimeout(t);
  }, [user]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <VectorPattern width={width} height={height} />
      <View style={{ backgroundColor: '#3F94FF', paddingHorizontal: 8 }}>
        <Logo height={100} />
      </View>
      <Text variant="body" weight={700} color="#FFFFFF" style={{ position: 'absolute', bottom: insets.bottom + 48, fontSize: 14, letterSpacing: 0.3 }}>
        Find work. Find people.
      </Text>
    </View>
  );
}
