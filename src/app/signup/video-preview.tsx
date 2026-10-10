import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, Icon, Text } from '@/components';
import { useSignup } from '@/data/signup';
import { VIDEO_POSTER } from '@/features/auth/media';
import { useTheme } from '@/theme';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Preview & trim after recording. "Use video" starts the upload and returns to Photos and video. */
export default function VideoPreview() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d = '42' } = useLocalSearchParams<{ d?: string }>();
  const { setSeeker } = useSignup();
  const dur = Math.min(60, Number(d) || 42);

  return (
    <View style={{ flex: 1, backgroundColor: c.mediaBlack }}>
      <Image source={VIDEO_POSTER} contentFit="cover" style={{ position: 'absolute', inset: 0 }} />
      <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 12, flexDirection: 'row', alignItems: 'center' }}>
        <BackButton tone="onBlue" onPress={() => router.replace('/signup/video-record')} />
        <Text variant="bodyL" weight={700} color="#FFFFFF" align="center" style={{ flex: 1, marginRight: 44 }}>
          Preview
        </Text>
      </View>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={28} color="#18191C" />
        </View>
      </View>
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 24, gap: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text variant="bodyS" weight={700} color="#FFFFFF" style={{ flex: 1 }}>
            Trim · 0:00 – {fmt(dur)}
          </Text>
          <Text variant="bodyS" weight={700} color="#FFFFFF">
            {fmt(dur)}
          </Text>
        </View>
        <View style={{ height: 48, borderRadius: 12, borderWidth: 3, borderColor: c.urgent, overflow: 'hidden', flexDirection: 'row' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Image key={i} source={VIDEO_POSTER} contentFit="cover" style={{ flex: 1, height: '100%', opacity: 0.85 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="neutral" label="Retake" onPress={() => router.replace('/signup/video-record')} style={{ flex: 1 }} />
          <Button
            label="Use video"
            style={{ flex: 1.4 }}
            onPress={() => {
              setSeeker({ video: { poster: VIDEO_POSTER, duration: fmt(dur), progress: 0 } });
              router.dismissTo('/signup/media');
            }}
          />
        </View>
      </View>
    </View>
  );
}
