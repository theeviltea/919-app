import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Icon, Pressable, Text, type IconName } from '@/components';
import { useTheme } from '@/theme';

/** Inner screen of profile / settings: back · centered 17/700 title · cards · pinned footer on a blurred panel. */
export function SubScreen({ title, footer, children, onBack, gap = 12 }: { title: string; footer?: ReactNode; children: ReactNode; onBack?: () => void; gap?: number }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.back }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 24, gap, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BackButton onPress={onBack} />
          <Text variant="bodyL" weight={700} align="center" accessibilityRole="header" style={{ flex: 1, fontSize: 17 }} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 44 }} />
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={
            {
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: Math.max(insets.bottom, 14) + 6,
              backgroundColor: c.surfacePanel,
              backdropFilter: 'blur(12px)',
              borderTopWidth: 1,
              borderColor: c.divider,
            } as object
          }>
          <View style={{ width: '100%', maxWidth: 568, alignSelf: 'center', gap: 12 }}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** White card, radius 24. `list` = rows that carry their own vertical rhythm (padding 6/18). */
export function Panel({ title, right, children, list, gap = 12, style }: { title?: string; right?: ReactNode; children?: ReactNode; list?: boolean; gap?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 18, paddingVertical: list ? 6 : 18, gap: list ? 0 : gap }, style]}>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: list ? 12 : 0, marginBottom: list ? 4 : 0 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header" style={{ flexShrink: 1 }}>
            {title}
          </Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** "ACCOUNT" — uppercase group label above a card. */
export function GroupLabel({ children }: { children: string }) {
  return (
    <Text variant="bodyS" weight={600} color="textBody" style={{ paddingTop: 8, paddingHorizontal: 4, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </Text>
  );
}

/** Dashed "+ Add …" button inside cards. */
export function DashedButton({ label, onPress, icon = 'add' }: { label: string; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ height: 44, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 }}>
      <Icon name={icon} size={18} color="link" />
      <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Tonal full-width destructive action: "Delete this experience". */
export function DangerTonal({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{ height: 52, borderRadius: 16, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}>
      <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Square 32–36 tile with a short code: EN, IG, WEB. */
export function CodeTile({ code, size = 32, tone = 'neutral' }: { code: string; size?: number; tone?: 'neutral' | 'brand' }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size >= 36 ? 12 : 10, backgroundColor: tone === 'brand' ? c.primarySecondary : c.input, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" weight={700} color={tone === 'brand' ? 'link' : 'textHeadline'} style={{ fontSize: 11 }}>
        {code}
      </Text>
    </View>
  );
}

/** 8px progress bar with "Profile completeness  85%". */
export function Completeness({ percent, tone = 'brand', hint, label = 'Profile completeness' }: { percent: number; tone?: 'brand' | 'warning'; hint?: string; label?: string }) {
  const { c } = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
          {label}
        </Text>
        <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
          {percent}%
        </Text>
      </View>
      <View style={{ marginTop: 6, height: 8, borderRadius: 999, backgroundColor: c.input }}>
        <View style={{ width: `${percent}%`, height: 8, borderRadius: 999, backgroundColor: tone === 'warning' ? c.warning : c.primary }} />
      </View>
      {hint ? (
        <Text variant="bodyS" color="textBody" style={{ marginTop: 8, fontSize: 13 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Timeline dot entry used by Experience / Education. */
export function TimelineItem({ title, sub, meta, last, right }: { title: string; sub: string; meta: string; last?: boolean; right?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <View style={{ width: 10, height: 10, marginTop: 6, borderRadius: 5, backgroundColor: c.primary }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={600}>
          {title}
        </Text>
        <Text variant="bodyS" color="textPrimary" style={{ marginTop: 2 }}>
          {sub}
        </Text>
        <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13 }}>
          {meta}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** Centered sheet hero: icon tile, Unbounded-free title 20/700 and a muted line. */
export function SheetHero({ icon, tone, title, text }: { icon: IconName; tone: 'neutral' | 'danger'; title: string; text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: tone === 'danger' ? c.dangerBack : c.input, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={30} color={tone === 'danger' ? 'dangerText' : 'textHeadline'} />
      </View>
      <Text variant="bodyL" weight={700} align="center" style={{ fontSize: 20, lineHeight: 26 }}>
        {title}
      </Text>
      <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
        {text}
      </Text>
    </View>
  );
}
