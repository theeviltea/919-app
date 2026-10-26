import { View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

import { AvatarSk, Line } from './SeekParts';

const ROWS: { photo: boolean; name: DimensionValue; sub: DimensionValue; last: DimensionValue; dot?: boolean }[] = [
  { photo: true, name: '58%', sub: '60%', last: '100%', dot: true },
  { photo: true, name: '56%', sub: '62%', last: '48%' },
  { photo: true, name: '86%', sub: '72%', last: '34%' },
  { photo: false, name: '40%', sub: '36%', last: '100%', dot: true },
  { photo: true, name: '76%', sub: '70%', last: '95%' },
];

/** SeekMessagesSkeleton: one card of chat rows (company photo with person avatar, name, vacancy, last message, time). */
export function SeekMessagesSkeleton() {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Loading chats" style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
      {ROWS.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < ROWS.length - 1 ? 1 : 0, borderColor: c.divider }}>
          <AvatarSk size={56} square={r.photo} badge={r.photo} />
          <View style={{ flex: 1, gap: 8, paddingTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Line w={r.name} h={12} />
              </View>
              <Line w={30} h={8} />
            </View>
            <Line w={r.sub} h={9} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Line w={r.last} h={10} />
              </View>
              {r.dot ? <Line w={20} h={20} /> : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
