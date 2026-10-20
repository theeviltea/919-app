import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, Pressable, Text } from '@/components';
import { useSession, type Role } from '@/data/session';

const INK = '#0B0C0F';
const BLUE = '#3F94FF';
const H = 156;

const copy = {
  seeker: { kicker: 'For talent', title: 'Be seen.\nGet hired.', cta: 'Create a profile', label: 'Create a talent profile on 919' },
  employer: { kicker: 'For employers', title: 'Find your\nnext star', cta: 'Post a vacancy', label: 'Sign up as an employer on 919' },
} as const;

const seekerPhoto = require('@/assets/images/mock/people2/q10.jpg');
const fan = [require('@/assets/images/mock/people2/q13.jpg'), require('@/assets/images/mock/people2/q19.jpg'), require('@/assets/images/mock/people2/q20.jpg')];

/** Guest zone promo under the tabs: dark editorial card that leads to sign-up with the role preselected.
 *  Seeker (Vacancies tab): portrait melting into the dark. Employer (Talent tab): a fan of profile cards. */
export function JoinBanner({ role }: { role: Role }) {
  const { setPendingRole } = useSession();
  const t = copy[role === 'employer' ? 'employer' : 'seeker'];
  const employer = role === 'employer';

  return (
    <Pressable
      onPress={() => {
        setPendingRole(role);
        router.push('/auth/register');
      }}
      accessibilityRole="button"
      accessibilityLabel={t.label}
      style={{ height: H, borderRadius: 24, overflow: 'hidden', backgroundColor: INK }}>
      {/* Blue glow behind the visual */}
      <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="78%" cy="55%" rx="45%" ry="75%">
            <Stop offset="0" stopColor={BLUE} stopOpacity={0.55} />
            <Stop offset="1" stopColor={BLUE} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glow)" />
      </Svg>

      {employer ? (
        <View style={{ position: 'absolute', right: 6, top: 0, bottom: 0, width: 168, alignItems: 'center', justifyContent: 'center' }}>
          {fan.map((src, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 72,
                height: 96,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                backgroundColor: '#22252B',
                transform: [{ translateX: (i - 1) * 44 }, { translateY: i === 1 ? -6 : 6 }, { rotate: `${(i - 1) * 10}deg` }],
                zIndex: i === 1 ? 2 : 1,
                boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
              }}>
              <Image source={src} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            </View>
          ))}
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
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '46%' }}>
          <Image source={seekerPhoto} contentFit="cover" contentPosition="top" style={{ width: '100%', height: '100%' }} />
          {/* Melt the photo into the dark card on the left and bottom */}
          <Svg style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} width="100%" height="100%">
            <Defs>
              <LinearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={INK} stopOpacity={1} />
                <Stop offset="0.55" stopColor={INK} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="tint" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0.5" stopColor={BLUE} stopOpacity={0} />
                <Stop offset="1" stopColor={BLUE} stopOpacity={0.35} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#tint)" />
            <Rect width="100%" height="100%" fill="url(#fadeL)" />
          </Svg>
        </View>
      )}

      {/* Copy */}
      <View style={{ flex: 1, paddingVertical: 16, paddingLeft: 18, paddingRight: employer ? 160 : '44%', justifyContent: 'space-between' }}>
        <View>
          <Text variant="caption" weight={700} color={BLUE} style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {t.kicker}
          </Text>
          <Text variant="displayL" color="#FFFFFF" numberOfLines={2} style={{ marginTop: 8, fontSize: 21, lineHeight: 23, textTransform: 'uppercase' }}>
            {t.title}
          </Text>
          <View style={{ marginTop: 8, width: 44, height: 4, borderRadius: 2, backgroundColor: BLUE }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyS" weight={700} color="#FFFFFF" style={{ fontSize: 13 }}>
            {t.cta}
          </Text>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow-right" size={13} color="#0B0C0F" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
