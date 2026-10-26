import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** EmpMessagesSkeleton: chat rows (avatar 56, name, context pills, last message, time) in one white card. */
export function EmpMessagesSkeleton() {
  const { c } = useTheme();
  const rows = [
    [96, 64, 150],
    [76, 0, 128],
    [104, 160, 230],
    [96, 150, 130],
    [76, 120, 74],
    [70, 150, 180],
  ];
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }} accessibilityLabel="Loading chats" accessibilityState={{ busy: true }}>
      {rows.map(([name, pill, last], i) => (
        <View key={i} style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderColor: c.divider }}>
            <Skeleton width={56} height={56} radius={28} strong />
            <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Skeleton width={name} height={11} radius={6} />
                <Skeleton width={28} height={8} radius={4} />
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Skeleton width={pill ? 64 : 64} height={22} radius={11} strong />
                {pill ? <Skeleton width={pill} height={22} radius={11} /> : null}
              </View>
              <Skeleton width={last} height={8} radius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
