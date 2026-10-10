import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { BackButton } from './IconButton';
import { Pressable } from './Pressable';
import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: ReactNode;
  /** Text link at the top right, e.g. "Create account". */
  headerAction?: { label: string; onPress: () => void };
  onBack?: () => void;
  hideBack?: boolean;
  /** Pinned footer (primary button). Sits on `back-panel` with a divider. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Above the title, e.g. "Step 1 of 5" progress. */
  top?: ReactNode;
};

/** Form screen on `back`: back button row, Unbounded title, content, pinned footer. Max width 560 on web. */
export function FormScreen({ title, subtitle, headerAction, onBack, hideBack, footer, children, top }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.back }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 }}>
          {hideBack ? null : <BackButton onPress={onBack} />}
          <View style={{ flex: 1 }}>{top}</View>
          {headerAction ? (
            <Pressable onPress={headerAction.onPress} accessibilityRole="link" hitSlop={8}>
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                {headerAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {title ? (
          <View style={{ gap: 8, marginTop: 6 }}>
            <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 29 }}>
              {title}
            </Text>
            {typeof subtitle === 'string' ? (
              <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 14) + 6, backgroundColor: c.backPanel, borderTopWidth: 1, borderColor: c.divider }}>
          <View style={{ width: '100%', maxWidth: 520, alignSelf: 'center', gap: 12 }}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** "Step 1 of 5" + segmented progress. */
export function StepProgress({ step, of }: { step: number; of: number }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }} accessibilityLabel={`Step ${step} of ${of}`}>
      <Text variant="caption" weight={600} color="textBody">
        Step {step} of {of}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: of }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: i < step ? c.primary : c.stroke }} />
        ))}
      </View>
    </View>
  );
}
