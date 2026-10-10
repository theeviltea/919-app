import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Pressable, Text } from '@/components';
import { VIDEO_POSTER } from '@/features/auth/media';
import { useTheme } from '@/theme';

const PROMPTS = [
  'Say your name and where you are based',
  'Tell about your experience: where you worked and what you did',
  'Languages you speak and when you can work',
];
const MAX = 60;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Video presentation recorder with on-screen prompts. Prototype: the camera feed is a still frame;
 * the real build uses expo-camera here.
 */
export default function VideoRecord() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [rec, setRec] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!rec) return;
    if (t >= MAX) return stop();
    const id = setTimeout(() => setT(t + 1), 1000);
    return () => clearTimeout(id);
  }, [rec, t]); // eslint-disable-line react-hooks/exhaustive-deps

  function stop() {
    setRec(false);
    router.replace({ pathname: '/signup/video-preview', params: { d: String(Math.max(t, 30)) } });
  }
  const prompt = Math.min(PROMPTS.length - 1, Math.floor(t / 15));

  return (
    <View style={{ flex: 1, backgroundColor: c.mediaBlack }}>
      <Image source={VIDEO_POSTER} contentFit="cover" style={{ position: 'absolute', inset: 0 }} />
      <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 12, flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="cancel" label="Close" tone="onBlue" onPress={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: rec ? c.dangerText : c.mediaOverlay, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />
            <Text variant="body" weight={700} color="#FFFFFF" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
              {fmt(t)} / {fmt(MAX)}
            </Text>
          </View>
        </View>
        <IconButton icon="camera" label="Switch camera" tone="onBlue" onPress={() => {}} />
      </View>
      <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 72, padding: 14, borderRadius: 16, backgroundColor: c.mediaOverlay }}>
        <Text variant="caption" weight={700} color="rgba(255,255,255,0.7)" style={{ letterSpacing: 0.6 }}>
          PROMPT {prompt + 1} OF {PROMPTS.length}
        </Text>
        <Text variant="body" weight={600} color="#FFFFFF" style={{ marginTop: 4 }}>
          {PROMPTS[prompt]}
        </Text>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 32, alignItems: 'center', gap: 10 }}>
        {!rec && t === 0 ? (
          <Text variant="bodyS" weight={600} color="#FFFFFF">
            Tap to start · 30–60 seconds
          </Text>
        ) : null}
        <Pressable
          onPress={() => (rec ? stop() : setRec(true))}
          accessibilityRole="button"
          accessibilityLabel={rec ? 'Stop recording' : 'Start recording'}
          style={{ width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: rec ? 30 : 60, height: rec ? 30 : 60, borderRadius: rec ? 8 : 30, backgroundColor: c.dangerText }} />
        </Pressable>
      </View>
    </View>
  );
}
