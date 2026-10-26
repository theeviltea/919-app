import { View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

import { Block, Line, SkCard } from './SeekParts';

const ROWS: [DimensionValue, DimensionValue, number, number][] = [
  ['70%', '58%', 92, 80],
  ['55%', '48%', 86, 140],
  ['92%', '58%', 86, 104],
  ['82%', '50%', 92, 90],
];

/** SeekApplicationsSkeleton: application cards (photo, title, company, pay, status footer). */
export function SeekApplicationsSkeleton() {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Loading applications" style={{ gap: 12 }}>
      {ROWS.map(([a, b, chip, note], i) => (
        <SkCard key={i} padding={14} gap={12}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Block w={56} h={56} r={16} />
            <View style={{ flex: 1, gap: 7 }}>
              <Line w={a} h={12} />
              <Line w={b} h={9} />
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Line w={74} h={10} />
                <Line w={46} h={8} />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
            <Block w={chip} h={26} r={999} />
            <Line w={note} h={9} />
            <View style={{ flex: 1 }} />
            {i === 0 ? <Line w={32} h={9} /> : null}
          </View>
        </SkCard>
      ))}
    </View>
  );
}
