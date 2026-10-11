import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { View, type ImageSourcePropType } from 'react-native';

import { Icon, Pressable, Text, useToast, type IconName } from '@/components';
import type { TalentTile, VideoTile } from '@/data/employer';
import { useTheme } from '@/theme';

/** Prototype stub for screens that come in the next stages (candidate profile, chat, vacancy page…). */
export function useSoon() {
  const toast = useToast();
  return (what: string) => toast({ text: `${what} — next stage of the prototype`, icon: 'clock', aboveTabBar: true });
}

/** 44 × 44 translucent button on the blue header (bell, edit, settings). */
export function GlassButton({ icon, label, onPress, dot }: { icon: IconName; label: string; onPress: () => void; dot?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.onMediaPill, alignItems: 'center', justifyContent: 'center' }, { backdropFilter: 'blur(8px)' } as object]}>
      <Icon name={icon} size={22} color="#FFFFFF" />
      {dot ? <View style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: c.urgent }} /> : null}
    </Pressable>
  );
}

/** Page title row on `back` (Vacancies, Messages) with a bordered square action. */
export function PageTitle({ title, action }: { title: string; action?: { icon: IconName; label: string; onPress: () => void } }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
      <Text variant="displayL" accessibilityRole="header" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>
        {title}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={action.icon} size={22} color="textHeadline" />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Small pill chip (status / context), 22–26 px. */
export function Pill({ label, icon, bg, fg, h = 22, shrink }: { label: string; icon?: IconName; bg: string; fg: string; h?: number; /** Long text (a vacancy title) gives way first. */ shrink?: boolean }) {
  return (
    <View style={{ flexShrink: shrink ? 1 : 0, minWidth: 0, height: h, paddingHorizontal: 8, borderRadius: 999, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {icon ? <Icon name={icon} size={13} color={fg} /> : null}
      <Text variant="caption" weight={700} color={fg} numberOfLines={1} style={{ fontSize: 12, flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );
}

export function Round({ source, size, bg }: { source: ImageSourcePropType; size: number; bg?: string }) {
  const { c } = useTheme();
  return <Image source={source} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg ?? c.backDarker }} />;
}

/** Field section header: Unbounded title, count, bordered "See all" chevron (TalentProfiles). */
export function RowHeader({ title, count, onAll }: { title: string; count: string; onAll: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 10 }}>
      <Text variant="title" accessibilityRole="header" style={{ fontSize: 17, lineHeight: 22 }}>
        {title}
      </Text>
      <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
        {count}
      </Text>
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={onAll}
        accessibilityRole="button"
        accessibilityLabel={`See all in ${title}`}
        style={{ width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevron-right" size={18} color="textHeadline" />
      </Pressable>
    </View>
  );
}

const usePh = () => {
  const { c } = useTheme();
  return (n: number) => [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][n - 1];
};

/** 128 × 128 candidate tile in a horizontal row. */
export function TalentTileCard({ t, onPress }: { t: TalentTile; onPress: () => void }) {
  const { c } = useTheme();
  const ph = usePh();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${t.name}, ${t.role}, ${t.city}`} style={{ width: 128, backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
      <View style={{ height: 128, backgroundColor: ph(t.placeholder) }}>
        <Image source={t.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} transition={150} />
        {t.premium ? (
          <View accessibilityLabel="Premium" style={{ position: 'absolute', left: 8, top: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: c.labelOrangeBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={14} color="labelOrangeText" />
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 11, paddingTop: 9, paddingBottom: 11 }}>
        <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 14 }}>
          {t.name}
        </Text>
        <Text variant="caption" weight={400} color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 12 }}>
          {t.role} · {t.city}
        </Text>
      </View>
    </Pressable>
  );
}

/** 138 × 230 video presentation tile (TalentVideos). */
export function VideoTileCard({ v, onPress }: { v: VideoTile; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Video presentation, ${v.name}, ${v.duration}`} style={{ width: 138, height: 230, borderRadius: 20, overflow: 'hidden', backgroundColor: v.tint }}>
      <Image source={v.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} transition={150} />
      <View style={{ position: 'absolute', left: 10, top: 10, height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.6)', justifyContent: 'center' }}>
        <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
          {v.duration}
        </Text>
      </View>
      <View style={{ position: 'absolute', left: 47, top: 78, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={20} color="#18191C" />
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 11, paddingTop: 10, paddingBottom: 11, backgroundColor: 'rgba(14,26,43,0.72)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="view" size={13} color="rgba(255,255,255,0.85)" />
          <Text variant="caption" weight={400} color="rgba(255,255,255,0.85)" style={{ fontSize: 11 }}>
            {v.views}
          </Text>
        </View>
        <Text variant="body" weight={700} color="#FFFFFF" numberOfLines={1} style={{ marginTop: 3, fontSize: 14 }}>
          {v.name}
        </Text>
        <Text variant="caption" weight={400} color="rgba(255,255,255,0.85)" style={{ marginTop: 1, fontSize: 11 }}>
          {v.city}
        </Text>
      </View>
    </Pressable>
  );
}

/** White rounded section (Company tabs, Recruiters). */
export function Section({ children, style }: { children: ReactNode; style?: object }) {
  const { c } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }, style]}>{children}</View>;
}
