import { Image } from 'expo-image';
import { View } from 'react-native';

import { Icon, Pressable, Text } from '@/components';
import { initialsOf, type CompanyInfo } from '@/data/employer';
import { useTheme } from '@/theme';

/** Company logo (or initials on a dark tile) with an optional camera badge. */
export function LogoTile({ info, size, onPress }: { info: Pick<CompanyInfo, 'name' | 'logo'>; size: number; onPress?: () => void }) {
  const { c } = useTheme();
  const r = Math.round(size * 0.27);
  const body = (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, borderRadius: r, backgroundColor: '#18191C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {info.logo ? (
          <Image source={info.logo} contentFit="cover" style={{ width: size, height: size }} />
        ) : (
          <Text variant="displayM" color="#FFFFFF" style={{ fontSize: size * 0.26, lineHeight: size * 0.32 }}>
            {initialsOf(info.name)}
          </Text>
        )}
      </View>
      {onPress ? (
        <View
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 3,
            borderColor: c.surface,
            backgroundColor: c.input,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="camera" size={16} color="textBody" />
        </View>
      ) : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Change company logo">
      {body}
    </Pressable>
  ) : (
    body
  );
}
