import type { ReactNode } from 'react';
import { View, type DimensionValue } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

/** Text line placeholder. */
export const Line = ({ w, h = 10, mt = 0 }: { w: DimensionValue; h?: number; mt?: number }) => <Skeleton width={w} height={h} radius={999} style={mt ? { marginTop: mt } : undefined} />;
/** Photo / avatar / button / chip placeholder. */
export const Block = ({ w, h, r = 12, mt = 0 }: { w: DimensionValue; h: number; r?: number; mt?: number }) => <Skeleton width={w} height={h} radius={r} strong style={mt ? { marginTop: mt } : undefined} />;

/** White card (radius 20 like the real ones). */
export function SkCard({ children, padding = 16, gap = 14, radius = 20 }: { children: ReactNode; padding?: number; gap?: number; radius?: number }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderRadius: radius, padding, gap }}>{children}</View>;
}

const FEED: [DimensionValue, DimensionValue, boolean][] = [
  ['80%', '70%', true],
  ['80%', '62%', false],
  ['76%', '70%', false],
  ['82%', '58%', true],
];

/** VacancyListCard placeholder (feed, search results). */
export function VacancyCardSk({ i = 0 }: { i?: number }) {
  const [a, b, chip] = FEED[i % FEED.length];
  return (
    <SkCard>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <Block w={56} h={56} r={16} />
        <View style={{ flex: 1, gap: 8, paddingTop: 4 }}>
          <Line w={a} h={12} />
          <Line w={b} h={9} />
          {chip ? <Block w={72} h={24} r={999} /> : <Line w="80%" h={8} />}
        </View>
        <Block w={44} h={44} r={14} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Line w={92} h={10} />
        <Line w={42} h={8} />
        <View style={{ flex: 1 }} />
        <Block w={66} h={26} r={999} />
        <Line w={40} h={8} />
      </View>
    </SkCard>
  );
}

/** Avatar with the small photo overlap used in chat rows and notifications. */
export function AvatarSk({ size = 56, square, badge }: { size?: number; square?: boolean; badge?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Block w={size} h={size} r={square ? Math.round(size * 0.29) : size / 2} />
      {badge ? (
        <View style={{ position: 'absolute', right: -4, bottom: -4, width: 30, height: 30, borderRadius: 15, backgroundColor: c.surface, padding: 2 }}>
          <Block w={26} h={26} r={13} />
        </View>
      ) : null}
    </View>
  );
}
