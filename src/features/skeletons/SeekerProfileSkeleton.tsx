import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Block, Line, SkCard } from './SeekParts';

/** SeekerProfileSkeleton: header card (cover, photo, name, buttons, stats) and the photo grid. */
export function SeekerProfileSkeleton() {
  const { c } = useTheme();
  return (
    <View accessibilityLabel="Loading profile" style={{ gap: 12 }}>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden', paddingBottom: 18 }}>
        <Block w="100%" h={88} r={0} />
        <View style={{ alignItems: 'center', marginTop: -52, gap: 10, paddingHorizontal: 18 }}>
          <View style={{ padding: 0, borderRadius: 52, backgroundColor: c.surface }}>
            <Block w={104} h={104} r={52} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Line w={132} h={14} />
            <Block w={22} h={22} r={11} />
          </View>
          <Line w={114} h={10} />
          <Line w={176} h={10} />
          <View style={{ flexDirection: 'row', gap: 6, alignSelf: 'stretch', marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Block w="100%" h={28} r={999} />
            </View>
            <View style={{ flex: 1 }}>
              <Block w="100%" h={28} r={999} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16, marginHorizontal: 18, paddingTop: 18, borderTopWidth: 1, borderColor: c.divider }}>
          {[68, 66, 36].map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
              <Line w={i === 2 ? 10 : 28} h={12} />
              <Line w={w} h={8} />
            </View>
          ))}
        </View>
      </View>
      <SkCard radius={24} padding={18} gap={16}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Line w={66} h={12} />
          <View style={{ flex: 1 }} />
          <Line w={28} h={9} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ width: '31.6%' }}>
              <Block w="100%" h={136} r={14} />
            </View>
          ))}
        </View>
      </SkCard>
    </View>
  );
}
