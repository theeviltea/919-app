import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Share, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Pressable, Text } from '@/components';
import { currentVideo } from '@/features/media/viewer';
import { useTheme } from '@/theme';

const shade = 'rgba(14,26,43,0.45)';
const toSec = (d: string) => d.split(':').reduce((s, p) => s * 60 + Number(p || 0), 0) || 42;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * Full-screen video (VideoPlayer). Prototype: there is no media file yet, so playback is simulated on the
 * poster — play / pause, scrubbing, mute and the timer behave like the real player will.
 */
export default function VideoPlayer() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [v] = useState(currentVideo);
  const total = v ? toSec(v.duration) : 42;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const bar = useRef<View>(null);
  const box = useRef({ x: 0, w: 1 });
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((x) => {
        if (x + 0.25 >= total) {
          setPlaying(false);
          return total;
        }
        return x + 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing, total]);

  if (!v) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={close} accessibilityRole="button" style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: shade, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  const toggle = () => {
    if (!playing && t >= total) setT(0);
    setPlaying(!playing);
  };
  const seek = (e: GestureResponderEvent) => {
    const r = Math.min(1, Math.max(0, (e.nativeEvent.pageX - box.current.x) / box.current.w));
    setT(r * total);
  };
  const pct = (t / total) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: '#2C2140' }}>
      <Stack.Screen options={{ animation: 'fade', contentStyle: { backgroundColor: '#000000' } }} />
      <StatusBar style="light" />
      <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'} style={{ position: 'absolute', inset: 0 }}>
        <Image source={v.poster} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} />
        {!playing ? (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play-filled" size={30} color="#18191C" />
            </View>
          </View>
        ) : null}
      </Pressable>

      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: insets.top + 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: shade, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: shade, justifyContent: 'center' }}>
            <Text variant="bodyS" weight={600} color="#FFFFFF" numberOfLines={1} style={{ fontSize: 13 }}>
              {v.label}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => setMuted(!muted)} accessibilityRole="button" accessibilityLabel={muted ? 'Unmute' : 'Mute'} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: shade, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={muted ? 'volume-off' : 'volume'} size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', right: 14, bottom: 300, gap: 14 }}>
        <Pressable onPress={() => Share.share({ message: `${v.name} · video presentation on 919` })} accessibilityRole="button" style={{ alignItems: 'center', gap: 4 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: shade, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="share" size={22} color="#FFFFFF" />
          </View>
          <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
            Share
          </Text>
        </Pressable>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 18, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 14, backgroundColor: 'rgba(14,26,43,0.82)', borderTopLeftRadius: 28, borderTopRightRadius: 28, gap: 12 }}>
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {v.avatar ? <Image source={v.avatar} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFE5FF' }} /> : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyL" weight={700} color="#FFFFFF" numberOfLines={1}>
                  {v.name}
                </Text>
                {v.verified ? <Icon name="verified" size={18} color="#FFFFFF" /> : null}
              </View>
              <Text variant="bodyS" color="rgba(255,255,255,0.8)" style={{ marginTop: 2, fontSize: 13 }} numberOfLines={1}>
                {v.subtitle}
              </Text>
            </View>
          </View>
          {v.text ? (
            <Text variant="body" color="rgba(255,255,255,0.92)" numberOfLines={3} style={{ fontSize: 14, lineHeight: 20 }}>
              {v.text}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text variant="caption" weight={400} color="rgba(255,255,255,0.8)" style={{ fontVariant: ['tabular-nums'] }}>
              {fmt(t)}
            </Text>
            <View
              ref={bar}
              onLayout={() => bar.current?.measureInWindow((x, _y, w) => (box.current = { x, w: w || 1 }))}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => (bar.current?.measureInWindow((x, _y, w) => (box.current = { x, w: w || 1 })), seek(e))}
              onResponderMove={seek}
              accessibilityRole="adjustable"
              accessibilityLabel="Video progress"
              accessibilityValue={{ min: 0, max: Math.round(total), now: Math.round(t) }}
              style={{ flex: 1, height: 24, justifyContent: 'center' }}>
              <View style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)' }}>
                <View style={{ width: `${pct}%`, height: 4, borderRadius: 999, backgroundColor: c.primary }} />
              </View>
              <View pointerEvents="none" style={{ position: 'absolute', left: `${pct}%`, marginLeft: -7, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF' }} />
            </View>
            <Text variant="caption" weight={400} color="rgba(255,255,255,0.8)" style={{ fontVariant: ['tabular-nums'] }}>
              {v.duration}
            </Text>
          </View>
          {v.own ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => (router.back(), router.push('/profile/general'))}
                accessibilityRole="button"
                style={{ flex: 1, height: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="body" weight={600} color="#FFFFFF" style={{ fontSize: 15 }}>
                  Replace video
                </Text>
              </Pressable>
              <Pressable onPress={toggle} accessibilityRole="button" style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name={playing ? 'pause' : 'play-filled'} size={16} color="#FFFFFF" />
                <Text variant="body" weight={700} color="#FFFFFF" style={{ fontSize: 15 }}>
                  {playing ? 'Pause' : t >= total ? 'Replay' : 'Play'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
