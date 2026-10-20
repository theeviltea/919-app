import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, Pressable, Text } from '@/components';
import { useSession, type Role } from '@/data/session';
import { useTheme } from '@/theme';

const BLUE = '#3F94FF';
const H = 156;
const ROTATE_MS = 3500;

/** Dark: editorial black card. Light: white card with a softer glow and dark type. */
const looks = {
  dark: { back: '#0B0C0F', glow: 0.55, title: '#FFFFFF', cta: '#FFFFFF', chip: '#FFFFFF', chipIcon: '#0B0C0F', cardBorder: '#FFFFFF', cardShadow: '0 10px 24px rgba(0,0,0,0.45)' },
  light: { back: '#FFFFFF', glow: 0.3, title: '#18191C', cta: '#18191C', chip: '#18191C', chipIcon: '#FFFFFF', cardBorder: '#FFFFFF', cardShadow: '0 10px 24px rgba(14,26,43,0.18)' },
};

const copy = {
  seeker: { kicker: 'For talent', title: 'Be seen.\nGet hired.', cta: 'Create a profile', label: 'Create a talent profile on 919' },
  employer: { kicker: 'For employers', title: 'Find your\nnext star', cta: 'Post a vacancy', label: 'Sign up as an employer on 919' },
} as const;

/** Cut-out people for the talent banner: hostess, chef & waitress, photographer, DJ, model. */
const cutouts = [
  require('@/assets/images/banner/talent1.webp'),
  require('@/assets/images/banner/talent2.webp'),
  require('@/assets/images/banner/talent3.webp'),
  require('@/assets/images/banner/talent4.webp'),
  require('@/assets/images/banner/talent5.webp'),
];
/** Profile photos that cycle through the employer banner's fan of cards. */
const faces = [
  require('@/assets/images/mock/people2/q13.jpg'),
  require('@/assets/images/mock/people2/q19.jpg'),
  require('@/assets/images/mock/people2/q20.jpg'),
  require('@/assets/images/mock/people2/q30.jpg'),
  require('@/assets/images/mock/people2/q18.jpg'),
  require('@/assets/images/mock/people2/q21.jpg'),
  require('@/assets/images/mock/people2/q10.jpg'),
  require('@/assets/images/mock/people2/q16.jpg'),
  require('@/assets/images/mock/people2/q29.jpg'),
  require('@/assets/images/mock/people2/q17.jpg'),
  require('@/assets/images/mock/people2/q28.jpg'),
  require('@/assets/images/mock/people2/q33.jpg'),
];

/** Ticks every ROTATE_MS; the guest list keeps the banner mounted, so the timer lives with it. */
function useTick() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, []);
  return n;
}

/** Guest zone promo under the tabs: leads to sign-up with the role preselected.
 *  Seeker (Vacancies tab): people from different fields take turns. Employer (Talent tab): faces change in a fan of profile cards. */
export function JoinBanner({ role }: { role: Role }) {
  const { scheme } = useTheme();
  const L = looks[scheme === 'dark' ? 'dark' : 'light'];
  const { setPendingRole } = useSession();
  const employer = role === 'employer';
  const t = copy[employer ? 'employer' : 'seeker'];
  const tick = useTick();

  return (
    <Pressable
      onPress={() => {
        setPendingRole(role);
        router.push('/auth/register');
      }}
      accessibilityRole="button"
      accessibilityLabel={t.label}
      style={{ height: H, borderRadius: 24, overflow: 'hidden', backgroundColor: L.back }}>
      {/* Blue glow behind the visual */}
      <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="76%" cy="62%" rx="42%" ry="78%">
            <Stop offset="0" stopColor={BLUE} stopOpacity={L.glow} />
            <Stop offset="1" stopColor={BLUE} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
      </Svg>

      {employer ? (
        <View style={{ position: 'absolute', right: 6, top: 0, bottom: 0, width: 168, alignItems: 'center', justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => {
            // One card changes per tick, left to right, so the fan always feels alive but never jumps all at once.
            const turns = Math.floor((tick + 2 - i) / 3);
            const src = faces[(i * 4 + turns) % faces.length];
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: 72,
                  height: 96,
                  borderRadius: 14,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: L.cardBorder,
                  backgroundColor: '#22252B',
                  transform: [{ translateX: (i - 1) * 44 }, { translateY: i === 1 ? -6 : 6 }, { rotate: `${(i - 1) * 10}deg` }],
                  zIndex: i === 1 ? 2 : 1,
                  boxShadow: L.cardShadow,
                }}>
                <Image source={src} contentFit="cover" transition={{ duration: 600, effect: 'cross-dissolve' }} style={{ width: '100%', height: '100%' }} />
              </View>
            );
          })}
          <View
            style={{
              position: 'absolute',
              zIndex: 3,
              right: 22,
              bottom: 16,
              height: 26,
              paddingHorizontal: 9,
              borderRadius: 999,
              backgroundColor: BLUE,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <Icon name="verified" size={13} color="#FFFFFF" />
            <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 11 }}>
              Verified talent
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ position: 'absolute', right: 0, top: 10, bottom: 0, width: '50%' }}>
          <Animated.View
            key={tick % cutouts.length}
            entering={FadeIn.duration(700).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(500)}
            style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            <Image source={cutouts[tick % cutouts.length]} contentFit="contain" contentPosition="bottom" style={{ width: '100%', height: '100%' }} />
          </Animated.View>
        </View>
      )}

      {/* Copy */}
      <View style={{ flex: 1, paddingVertical: 16, paddingLeft: 18, paddingRight: employer ? 160 : '48%', justifyContent: 'space-between' }}>
        <View>
          <Text variant="caption" weight={700} color={BLUE} style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {t.kicker}
          </Text>
          <Text variant="displayL" color={L.title} numberOfLines={2} style={{ marginTop: 8, fontSize: 21, lineHeight: 23, textTransform: 'uppercase' }}>
            {t.title}
          </Text>
          <View style={{ marginTop: 8, width: 44, height: 4, borderRadius: 2, backgroundColor: BLUE }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyS" weight={700} color={L.cta} style={{ fontSize: 13 }}>
            {t.cta}
          </Text>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: L.chip, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow-right" size={13} color={L.chipIcon} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
