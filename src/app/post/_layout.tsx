import { Stack } from 'expo-router';

import { DraftProvider } from '@/features/post/draft';
import { useTheme } from '@/theme';

/** New vacancy flow: one draft for all steps; leaving the flow drops it. */
export default function PostLayout() {
  const { c } = useTheme();
  return (
    <DraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.back } }} />
    </DraftProvider>
  );
}
