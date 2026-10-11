import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
export type TabMeta = Record<string, { label: string; icon: IconName; badge?: number }>;

/**
 * 919 tab bar: `surface-panel` with blur and a top divider. Active item is recoloured `primary` on a
 * `primary-secondary` pill; the icon stays stroke (never filled). Badge = unread count.
 */
export function TabBar({ state, navigation, insets, meta }: TabBarProps & { meta: TabMeta }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          paddingTop: 10,
          paddingHorizontal: 8,
          paddingBottom: Math.max(insets.bottom, 12) + 4,
          backgroundColor: c.surfacePanel,
          borderTopWidth: 1,
          borderColor: c.divider,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        { backdropFilter: 'blur(12px)' } as object,
      ]}>
      {state.routes.map((route, i) => {
        const m = meta[route.name];
        if (!m) return null;
        const focused = state.index === i;
        const col = focused ? 'primary' : 'textBody';
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={m.badge ? `${m.label}, ${m.badge} unread` : m.label}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ width: 56, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? c.primarySecondary : 'transparent' }}>
              <Icon name={m.icon} size={22} color={col} />
              {m.badge ? (
                <View style={{ position: 'absolute', top: -3, right: 6, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: c.error, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 10, lineHeight: 12 }}>
                    {m.badge > 99 ? '99+' : m.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="caption" weight={600} color={col} style={{ fontSize: 11, lineHeight: 14 }}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Bottom padding for scroll content under the floating tab bar. */
export const TAB_BAR_SPACE = 96;
