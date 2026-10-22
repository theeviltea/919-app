import { Image } from 'expo-image';
import { View } from 'react-native';

import { MaxFrame, PhotoTierBadge, Pressable, Text } from '@/components';
import type { Talent } from '@/data/types';
import { useTheme } from '@/theme';

/** Talent grid card (design system: ProfileCard): photo 150, plan badge on the photo, Max frame, name, role · city. */
export function TalentCard({ t, onPress }: { t: Talent; onPress: () => void }) {
  const { c } = useTheme();
  const ph = [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][t.placeholder - 1];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${t.name}, ${t.role}, ${t.city}`} style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden', zIndex: 0 }}>
      <View style={{ height: 150, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        <PhotoTierBadge tier={t.tier} />
      </View>
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
        <Text variant="body" weight={600} style={{ fontSize: 14 }} numberOfLines={1}>
          {t.name}
        </Text>
        <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 2 }} numberOfLines={1}>
          {t.role} · {t.city}
        </Text>
      </View>
      <MaxFrame frame={t.frame} />
    </Pressable>
  );
}
