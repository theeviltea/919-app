import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, Pressable, Text } from '@/components';
import { lastSent, shortDate } from '@/features/post/draft';
import { useTheme } from '@/theme';

/** VacSent: the vacancy is on review. */
export default function VacancySent() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const s = lastSent.current;
  // "AED 5 000 · one-time" → "AED 5 000" on the card, like the design.
  const pay = s?.pay.split(' · ')[0];
  const meta = [s?.city, pay, shortDate(s?.start)].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <View style={{ flex: 1, paddingTop: insets.top + 60, paddingHorizontal: 20, gap: 22 }}>
        <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.back, borderWidth: 1, borderColor: c.control, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="clock" size={36} color="textBody" />
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="displayM" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 29 }}>
            Vacancy sent for review
          </Text>
          <Text variant="body" color="textBody" style={{ fontSize: 15, lineHeight: 22 }}>
            The 919 team checks every vacancy, usually within an hour. We’ll notify you as soon as it goes live.
          </Text>
        </View>
        {s ? (
          <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', backgroundColor: c.control }}>
              {s.cover ? <Image source={s.cover} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
            </View>
            <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
              <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15, alignSelf: 'stretch' }}>
                {s.title}
              </Text>
              <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 3, fontSize: 13 }}>
                {meta}
              </Text>
              <View style={{ marginTop: 8, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="clock" size={13} color="textBody" />
                <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 12 }}>
                  On review
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 20) + 14, gap: 10 }}>
        <Button size="l" label="Go to my vacancies" onPress={() => router.dismissTo('/hire/vacancies')} />
        <Pressable
          onPress={() => router.dismissTo('/post/category')}
          accessibilityRole="button"
          style={{ height: 56, borderRadius: 18, borderWidth: 1, borderColor: c.control, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="add" size={20} color="textHeadline" />
          <Text variant="bodyL" weight={600} style={{ fontSize: 16 }}>
            Create another
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
