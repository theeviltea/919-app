import { Image } from 'expo-image';
import { View } from 'react-native';

import { Icon, Pressable, Text } from '@/components';
import type { Talent } from '@/data/types';
import { useTheme } from '@/theme';

/** Talent grid card: photo 150, Premium badge, name with initial, role · city. */
export function TalentCard({ t, onPress }: { t: Talent; onPress: () => void }) {
  const { c } = useTheme();
  const ph = [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][t.placeholder - 1];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${t.name}, ${t.role}, ${t.city}`} style={{ flex: 1, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
      <View style={{ height: 150, backgroundColor: ph }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        {t.premium ? (
          <View style={{ position: 'absolute', left: 8, top: 8, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star" size={12} color="labelOrangeText" />
            <Text variant="caption" weight={700} color="labelOrangeText" style={{ fontSize: 11 }}>
              Premium
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text variant="body" weight={600} style={{ fontSize: 14 }} numberOfLines={1}>
            {t.name}
          </Text>
          {t.verified ? <Icon name="verified" size={14} color="primary" /> : null}
        </View>
        <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 2 }} numberOfLines={1}>
          {t.role} · {t.city}
        </Text>
      </View>
    </Pressable>
  );
}
