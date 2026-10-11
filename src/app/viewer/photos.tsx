import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Share, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Pressable, Text } from '@/components';
import { Pager } from '@/features/media/Pager';
import { currentPhotos } from '@/features/media/viewer';
import { ZoomableImage } from '@/features/media/ZoomableImage';

const glass = { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' } as object;

/** Full-screen photo viewer (PhotoViewer): swipe between photos, pinch or double tap to zoom, thumbnails below. */
export default function PhotoViewer() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [set] = useState(currentPhotos);
  const [index, setIndex] = useState(set?.index ?? 0);
  const [zoomed, setZoomed] = useState(false);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!set?.photos.length) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={close} accessibilityRole="button" style={glass}>
          <Icon name="cancel" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  const many = set.photos.length > 1;
  const top = insets.top + 12 + 44 + 16;
  const bottom = many ? Math.max(insets.bottom, 24) + 16 + 52 + 40 : Math.max(insets.bottom, 24) + 16;
  const frameH = Math.max(240, height - top - bottom);
  const go = (i: number) => setIndex(i);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Stack.Screen options={{ animation: 'fade', contentStyle: { backgroundColor: '#000000' } }} />
      <StatusBar style="light" />
      <View style={{ position: 'absolute', left: 0, right: 0, top, height: frameH }}>
        <Pager
          count={set.photos.length}
          width={width}
          height={frameH}
          index={index}
          onIndex={setIndex}
          enabled={!zoomed}
          renderItem={(i) => <ZoomableImage key={i} source={set.photos[i]} width={width} height={frameH} onZoom={setZoomed} />}
        />
      </View>

      <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 12, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={glass}>
          <Icon name="cancel" size={22} color="#FFFFFF" />
        </Pressable>
        <Text variant="body" weight={700} color="#FFFFFF" align="center" style={{ flex: 1, fontSize: 15 }}>
          {many ? `${index + 1} / ${set.photos.length}` : ''}
        </Text>
        <Pressable onPress={() => Share.share({ message: 'Photo from 919' })} accessibilityRole="button" accessibilityLabel="Share" style={glass}>
          <Icon name="share" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {many ? (
        <>
          <Text variant="caption" weight={400} color="rgba(255,255,255,0.6)" align="center" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 24) + 16 + 52 + 12 }}>
            Swipe to see more · pinch to zoom
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 24) + 16, flexGrow: 0 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, minWidth: '100%', justifyContent: 'center' }}>
            {set.photos.map((p, i) => (
              <Pressable
                key={i}
                onPress={() => go(i)}
                accessibilityRole="button"
                accessibilityLabel={`Photo ${i + 1}`}
                accessibilityState={{ selected: i === index }}
                style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', opacity: i === index ? 1 : 0.55, borderWidth: i === index ? 2 : 0, borderColor: '#FFFFFF', backgroundColor: '#2C2140' }}>
                <Image source={p} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} />
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}
