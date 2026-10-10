import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Show the 40×40 close button next to the title. */
  closable?: boolean;
  children: ReactNode;
};

/** BottomSheet — over `scrim`, radius 28 on top, grabber. Used for every confirmation in 919. */
export function BottomSheet({ visible, onClose, title, subtitle, closable, children }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (visible) {
      y.setValue(1);
      Animated.timing(y, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible, y]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} accessibilityLabel="Close" style={{ flex: 1, backgroundColor: c.scrim }} />
      <Animated.View
        accessibilityViewIsModal
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: c.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 10,
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 20) + 8,
          gap: 12,
          maxWidth: 560,
          alignSelf: 'center',
          width: '100%',
          transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, 600] }) }],
        }}>
        <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 999, backgroundColor: c.backDarker }} />
        {title ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Text variant="title" accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? (
                <Text variant="body" color="textPrimary" style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {closable ? (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cancel" size={20} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {children}
      </Animated.View>
    </Modal>
  );
}
