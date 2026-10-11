import { Icon, Pressable, useToast } from '@/components';
import { useSeeker } from '@/data/seeker';
import { useTheme } from '@/theme';

/** Bookmark on vacancy cards: outline when not saved, filled tile when saved. */
export function SaveButton({ vacancyId, size = 40 }: { vacancyId: string; size?: number }) {
  const { c } = useTheme();
  const { saved, toggleSaved } = useSeeker();
  const toast = useToast();
  const on = saved.includes(vacancyId);
  return (
    <Pressable
      onPress={() => {
        const now = toggleSaved(vacancyId);
        toast({ text: now ? 'Saved to your vacancies' : 'Removed from saved', kind: 'neutral', icon: 'bookmark', aboveTabBar: true });
      }}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Remove from saved' : 'Save vacancy'}
      accessibilityState={{ selected: on }}
      hitSlop={6}
      style={{ width: size, height: size, borderRadius: 12, borderWidth: on ? 0 : 1, borderColor: c.stroke, backgroundColor: on ? c.primarySecondary : c.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={on ? 'bookmark-filled' : 'bookmark'} size={20} color={on ? 'primary' : 'textBody'} />
    </Pressable>
  );
}
