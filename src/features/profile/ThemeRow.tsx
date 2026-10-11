import { Row, Toggle } from '@/components';
import { useTheme } from '@/theme';

/** Settings row: one switch for dark theme. Until it is touched, the app follows the phone. */
export function ThemeRow({ last = true }: { last?: boolean }) {
  const { scheme, preference, setPreference } = useTheme();
  const dark = scheme === 'dark';
  return (
    <Row
      icon="moon"
      title="Dark theme"
      subtitle={preference === 'system' ? 'Follows your phone settings' : dark ? 'On' : 'Off'}
      right={<Toggle value={dark} onValueChange={(v) => setPreference(v ? 'dark' : 'light')} accessibilityLabel="Dark theme" />}
      last={last}
    />
  );
}
