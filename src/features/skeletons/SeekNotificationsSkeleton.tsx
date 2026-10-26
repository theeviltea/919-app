import { View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

import { AvatarSk, Block, Line, SkCard } from './SeekParts';

type Row = { badge: boolean; title: DimensionValue; sub: DimensionValue; text: DimensionValue; text2: DimensionValue; action?: number };
const TODAY: Row[] = [
  { badge: true, title: '78%', sub: '44%', text: '94%', text2: '33%', action: 96 },
  { badge: true, title: '68%', sub: '24%', text: '72%', text2: '33%' },
  { badge: false, title: '78%', sub: '18%', text: '92%', text2: '47%', action: 136 },
];
const EARLIER: Row[] = [
  { badge: false, title: '70%', sub: '30%', text: '88%', text2: '30%' },
  { badge: false, title: '66%', sub: '27%', text: '80%', text2: '40%' },
];

function Rows({ rows }: { rows: Row[] }) {
  const { c } = useTheme();
  return (
    <SkCard radius={24} padding={16} gap={0}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderColor: c.divider }}>
          <AvatarSk size={44} badge={r.badge} />
          <View style={{ flex: 1, gap: 10, paddingTop: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Line w={r.title} h={11} />
              </View>
              <Line w={28} h={8} />
            </View>
            <Line w={r.sub} h={11} />
            <Line w={r.text} h={9} />
            <Line w={r.text2} h={9} />
            {r.action ? <Block w={r.action} h={36} r={12} mt={4} /> : null}
          </View>
        </View>
      ))}
    </SkCard>
  );
}

/** SeekNotificationsSkeleton: day headers and grouped notification rows under the real filter chips. */
export function SeekNotificationsSkeleton() {
  return (
    <View accessibilityLabel="Loading notifications" style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 20, paddingHorizontal: 4 }}>
        <Line w={52} h={9} />
        <View style={{ flex: 1 }} />
        <Line w={96} h={9} />
      </View>
      <Rows rows={TODAY} />
      <View style={{ height: 20, justifyContent: 'center', paddingHorizontal: 4 }}>
        <Line w={44} h={9} />
      </View>
      <Rows rows={EARLIER} />
    </View>
  );
}
