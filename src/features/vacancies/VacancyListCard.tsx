import { Image } from 'expo-image';
import { View } from 'react-native';

import { Pressable, StatusChip, Text } from '@/components';
import { contractLabelColors, contractTypes, formatAmount } from '@/data/dictionaries';
import type { Vacancy } from '@/data/types';
import { useTheme } from '@/theme';

export function PayLabel({ contract }: { contract: Vacancy['pay']['contract'] }) {
  const { c } = useTheme();
  const t = contractTypes[contract];
  const col = contractLabelColors[t.tone];
  return (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c[col.back], justifyContent: 'center' }}>
      <Text variant="caption" weight={600} color={col.text}>
        {t.label}
      </Text>
    </View>
  );
}

/** Vacancy card in lists: cover 56, title, company · city, Urgent, pay row. */
export function VacancyListCard({ v, onPress }: { v: Vacancy; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${v.title}, ${v.company.name}`} style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <Image source={v.cover} contentFit="cover" style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: c.backDarker }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyL" style={{ lineHeight: 21 }}>
            {v.title}
          </Text>
          <Text variant="bodyS" color="textBody" style={{ marginTop: 4 }}>
            {v.company.name} · {v.city}
          </Text>
          {v.urgent ? (
            <View style={{ marginTop: 8 }}>
              <StatusChip kind="urgent" label="Urgent" />
            </View>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text variant="bodyL" weight={700} style={{ fontSize: 17 }}>
          {v.pay.currency} {formatAmount(v.pay.amount)}
        </Text>
        <Text variant="bodyS" color="textBody">
          {contractTypes[v.pay.contract].suffix}
        </Text>
        <View style={{ flex: 1 }} />
        <PayLabel contract={v.pay.contract} />
        <Text variant="caption" weight={400} color="textBody">
          {v.postedAgo}
        </Text>
      </View>
    </Pressable>
  );
}
