import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Props = { icon: IconName; title: string; text: string; action?: { label: string; icon?: IconName; onPress: () => void }; passive?: boolean };

/** EmptyState — icon tile 88, Unbounded title, one line of help, at most one action. */
export function EmptyState({ icon, title, text, action, passive }: Props) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 48 }}>
      <View style={{ width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: passive ? c.backDarker : c.primarySecondary }}>
        <Icon name={icon} size={40} color={passive ? 'textBody' : 'primary'} />
      </View>
      <Text variant="title" align="center" style={{ marginTop: 20 }}>
        {title}
      </Text>
      <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
        {text}
      </Text>
      {action ? <Button label={action.label} icon={action.icon} onPress={action.onPress} style={{ alignSelf: 'stretch', marginTop: 20 }} /> : null}
    </View>
  );
}
