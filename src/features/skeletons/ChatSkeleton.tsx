import { View, type DimensionValue } from 'react-native';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme';

function Pill({ w }: { w: number }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'center', height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.surface, justifyContent: 'center' }}>
      <Skeleton width={w} height={8} radius={4} />
    </View>
  );
}

function SystemLine({ w }: { w: number }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.surface }}>
      <Skeleton width={24} height={24} radius={12} strong />
      <Skeleton width={w} height={8} radius={4} />
      <Skeleton width={28} height={6} radius={3} />
    </View>
  );
}

function Incoming({ lines }: { lines: DimensionValue[] }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'flex-start', width: '78%', borderRadius: 20, borderBottomLeftRadius: 6, backgroundColor: c.surface, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, gap: 8 }}>
      {lines.map((w, i) => (
        <Skeleton key={i} width={w} height={8} radius={4} />
      ))}
      <Skeleton width={28} height={6} radius={3} style={{ alignSelf: 'flex-end' }} />
    </View>
  );
}

function Outgoing({ w, h }: { w: DimensionValue; h: number }) {
  return <Skeleton width={w} height={h} radius={20} strong style={{ alignSelf: 'flex-end', borderBottomRightRadius: 6 }} />;
}

/** Vacancy card at the top of a chat (EmpChatSkeleton / SeekChatSkeleton). */
function CardBlock() {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 10, borderRadius: 20, backgroundColor: c.surface }}>
      <Skeleton width={64} height={64} radius={14} strong />
      <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
        <Skeleton width={50} height={8} radius={4} />
        <Skeleton width="70%" height={10} radius={5} />
        <Skeleton width="55%" height={8} radius={4} />
      </View>
    </View>
  );
}

/**
 * Messages area while a chat loads (SeekChatSkeleton / EmpChatSkeleton): dates, system lines,
 * incoming white bubbles and outgoing blue blocks. Header, context chips and composer stay real.
 */
export function ChatSkeleton({ variant, card }: { variant: 'seeker' | 'employer'; card?: boolean }) {
  return (
    <View style={{ flex: 1, padding: 12, paddingBottom: 16, gap: 8, justifyContent: 'flex-end', width: '100%', maxWidth: 720, alignSelf: 'center' }} accessibilityLabel="Loading messages" accessibilityRole="progressbar">
      {card ? <CardBlock /> : null}
      <View style={{ height: 6 }} />
      <Pill w={56} />
      {variant === 'seeker' ? (
        <>
          <SystemLine w={200} />
          <Incoming lines={['82%', '40%']} />
          <Outgoing w="24%" h={56} />
          <Outgoing w="60%" h={56} />
          <Pill w={34} />
          <Incoming lines={['70%']} />
          <Outgoing w="82%" h={78} />
          <Outgoing w="82%" h={56} />
        </>
      ) : (
        <>
          <SystemLine w={210} />
          <SystemLine w={190} />
          <Outgoing w="82%" h={78} />
          <Outgoing w="70%" h={106} />
          <Outgoing w="78%" h={56} />
          <Pill w={34} />
          <Incoming lines={['82%']} />
        </>
      )}
    </View>
  );
}
