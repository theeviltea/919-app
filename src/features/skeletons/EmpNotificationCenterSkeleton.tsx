import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

type Item = { title: number; lines: number[]; action?: number; tile?: boolean };

function Group({ items }: { items: Item[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ paddingTop: 8, paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width={44} height={9} radius={5} />
        <Skeleton width={96} height={9} radius={5} />
      </View>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
        {items.map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderColor: c.divider }}>
            <View style={{ width: 44, height: 44 }}>
              <Skeleton width={44} height={44} radius={14} strong />
              {n.tile ? null : (
                <View style={{ position: 'absolute', right: -3, bottom: -3, borderRadius: 12, borderWidth: 2, borderColor: c.surface }}>
                  <Skeleton width={20} height={20} radius={10} strong />
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 9, paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Skeleton width={`${n.title}%`} height={10} radius={5} />
                </View>
                <Skeleton width={26} height={8} radius={4} />
                <Skeleton width={8} height={8} radius={4} />
              </View>
              {n.lines.map((w, k) => (
                <Skeleton key={k} width={`${w}%`} height={8} radius={4} />
              ))}
              {n.action ? <Skeleton width={n.action} height={36} radius={12} strong style={{ marginTop: 4 }} /> : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** EmpNotificationCenterSkeleton: New and Earlier groups of notification rows under the real filter chips. */
export function EmpNotificationCenterSkeleton() {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading notifications" accessibilityState={{ busy: true }}>
      <Group
        items={[
          { title: 85, lines: [30, 92], action: 130 },
          { title: 82, lines: [20, 92], action: 96 },
          { title: 76, lines: [55, 92, 65], action: 140, tile: true },
          { title: 62, lines: [92, 28], tile: true },
        ]}
      />
      <Group items={[{ title: 75, lines: [90] }, { title: 68, lines: [88, 40] }]} />
    </View>
  );
}
