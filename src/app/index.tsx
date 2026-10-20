import { router } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo, Text, VectorPattern } from '@/components';
import { useSession } from '@/data/session';

/** Splash — animated vector pattern edge to edge, big logo, tagline. Leads to the guest zone (or home when signed in). */
export default function Splash() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  useEffect(() => {
    const t = setTimeout(() => router.replace(user ? (user.role === 'seeker' ? '/seeker' : '/hire') : '/guest'), 2200);
    return () => clearTimeout(t);
  }, [user]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F94FF' }}>
      <VectorPattern width={width} height={height} animated />
      <Animated.View
        entering={ZoomIn.duration(600)
          .delay(150)
          .easing(Easing.out(Easing.back(1.6)))}
        style={{ backgroundColor: '#3F94FF', paddingHorizontal: 8 }}>
        <Logo height={100} />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(500).delay(550)} style={{ position: 'absolute', bottom: insets.bottom + 48 }}>
        <Text variant="body" weight={700} color="#FFFFFF" style={{ fontSize: 14, letterSpacing: 0.3 }}>
          Find work. Find people.
        </Text>
      </Animated.View>
    </View>
  );
}
