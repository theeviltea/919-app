import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components';
import { findVacancy } from '@/data/mock';
import type { Msg, Thread } from '@/data/seeker';
import { useTheme } from '@/theme';

export function lastLine(t: Thread): { text: string; mine: boolean } {
  if (t.state === 'request') return { text: t.requestText ?? 'Wants to contact you', mine: false };
  const m = [...t.messages].reverse().find((x) => x.kind !== 'date') as Exclude<Msg, { kind: 'date' }> | undefined;
  if (!m) return { text: '', mine: false };
  if (m.kind === 'system') return { text: m.text, mine: false };
  const mine = m.mine;
  if (m.kind === 'text') return { text: m.text, mine };
  if (m.kind === 'photos') return { text: m.text || `Photo${m.photos.length > 1 ? `s · ${m.photos.length}` : ''}`, mine };
  if (m.kind === 'video') return { text: m.text ? `Video · ${m.text}` : 'Video', mine };
  return { text: `Contact · ${m.name}`, mine };
}

/** Thread avatar: vacancy cover with a small person avatar, or company initials for direct requests. */
export function ThreadAvatar({ t, size = 52 }: { t: Thread; size?: number }) {
  const { c } = useTheme();
  const v = t.vacancyId ? findVacancy(t.vacancyId) : undefined;
  const small = Math.round(size * 0.46);
  return (
    <View style={{ width: size, height: size }}>
      {v ? (
        <Image source={v.cover} contentFit="cover" style={{ width: size, height: size, borderRadius: 16, backgroundColor: c.backDarker }} />
      ) : (
        <View style={{ width: size, height: size, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="bodyL" weight={700} color="ctaButtonText">
            {t.company.initials}
          </Text>
        </View>
      )}
      {t.person.photo ? (
        <Image
          source={t.person.photo}
          contentFit="cover"
          style={{ position: 'absolute', right: -4, bottom: -4, width: small, height: small, borderRadius: small / 2, borderWidth: 2, borderColor: c.surface, backgroundColor: c.backDarker }}
        />
      ) : null}
      {t.person.online ? <View style={{ position: 'absolute', right: -3, top: -3, width: 12, height: 12, borderRadius: 6, backgroundColor: c.success, borderWidth: 2, borderColor: c.surface }} /> : null}
    </View>
  );
}
