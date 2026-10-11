import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { useSignup, type Photo } from '@/data/signup';
import { MAX_PHOTOS, MIN_PHOTOS, SAMPLE_PHOTOS, VIDEO_POSTER } from '@/features/auth/media';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { pickVideo } from '@/features/auth/pickImage';
import { useTheme } from '@/theme';

let seq = 0;

/** Seeker sign-up, step 4 — photos (at least 3) and an optional video presentation. Same set for every field. */
export default function Media() {
  const { c } = useTheme();
  const { seeker, setSeeker } = useSignup();
  const edit = !!useLocalSearchParams<{ edit?: string }>().edit;
  const [photoSheet, setPhotoSheet] = useState(false);
  const [videoSheet, setVideoSheet] = useState(false);
  const photos = seeker.photos;

  const add = (sources: Photo['source'][]) =>
    setSeeker((s) => ({ photos: [...s.photos, ...sources.slice(0, MAX_PHOTOS - s.photos.length).map((source) => ({ id: `ph${++seq}`, source, progress: 0 }))] }));
  const remove = (id: string) => setSeeker((s) => ({ photos: s.photos.filter((p) => p.id !== id) }));
  const ready = photos.filter((p) => p.progress === undefined).length;

  const tile = { width: '31.5%', aspectRatio: 0.94, borderRadius: 16, overflow: 'hidden' } as const;

  return (
    <FormScreen
      top={edit ? undefined : <StepProgress step={4} of={5} />}
      title="Photos and video"
      subtitle="The same set shows for every field you work in. At least 3 photos are required, video is optional."
      footer={<Button size="l" label={edit ? 'Save' : 'Continue'} disabled={ready < MIN_PHOTOS} onPress={() => (edit ? router.back() : router.push('/signup/review'))} />}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1 }}>
          Photos *
        </Text>
        <Text variant="bodyS" color={photos.length < MIN_PHOTOS ? 'attentionText' : 'textBody'}>
          {photos.length < MIN_PHOTOS ? `Add ${MIN_PHOTOS - photos.length} more · ` : ''}
          {photos.length} / {MAX_PHOTOS}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((p, i) => (
          <View key={p.id} style={[tile, { backgroundColor: c.backDarker }]}>
            <Image source={p.source} contentFit="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel={`Photo ${i + 1}`} />
            {p.progress !== undefined ? (
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(24,25,27,0.45)', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', borderTopColor: '#FFFFFF' }} />
                <Text variant="caption" weight={700} color="#FFFFFF">
                  {p.progress}%
                </Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => remove(p.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${i + 1}`}
              hitSlop={6}
              style={{ position: 'absolute', right: 6, top: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: c.mediaOverlay, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cancel" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <Pressable
            onPress={() => setPhotoSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            style={[tile, { borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 6 }]}>
            <Icon name="camera" size={22} color="link" />
            <Text variant="bodyS" weight={700} color="link">
              Add photo
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text variant="bodyL" weight={700} style={{ marginTop: 8 }}>
        Video presentation
      </Text>
      {seeker.video ? (
        <View style={{ height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: c.mediaBlack }}>
          <Image source={seeker.video.poster} contentFit="contain" style={{ width: '100%', height: '100%' }} />
          {seeker.video.progress !== undefined ? (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, gap: 6, experimental_backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6))' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text variant="body" weight={700} color="#FFFFFF" style={{ flex: 1, fontSize: 14 }}>
                  Uploading…
                </Text>
                <Text variant="body" weight={700} color="#FFFFFF" style={{ fontSize: 14 }}>
                  {seeker.video.progress}%
                </Text>
              </View>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <View style={{ width: `${seeker.video.progress}%`, height: 4, borderRadius: 2, backgroundColor: c.primary }} />
              </View>
              <Text variant="caption" weight={400} color="rgba(255,255,255,0.85)">
                You can keep filling in your profile
              </Text>
            </View>
          ) : (
            <>
              <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="play" size={22} color="#18191C" />
                </View>
              </View>
              <View style={{ position: 'absolute', left: 12, bottom: 12, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.mediaOverlay, justifyContent: 'center' }}>
                <Text variant="caption" weight={700} color="#FFFFFF">
                  {seeker.video.duration}
                </Text>
              </View>
            </>
          )}
          <Pressable
            onPress={() => setSeeker({ video: undefined })}
            accessibilityRole="button"
            accessibilityLabel="Remove video"
            style={{ position: 'absolute', right: 10, top: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: c.mediaOverlay, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cancel" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setVideoSheet(true)}
          accessibilityRole="button"
          style={{ height: 160, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 24 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Icon name="video" size={22} color="primary" />
          </View>
          <Text variant="body" weight={700} color="link">
            Add video presentation
          </Text>
          <Text variant="bodyS" color="textBody" align="center">
            Up to 60 seconds · profiles with video get 3× more replies
          </Text>
        </Pressable>
      )}

      <PhotoSheet visible={photoSheet} title="Add photos" onClose={() => setPhotoSheet(false)} multiple limit={MAX_PHOTOS - photos.length} sample={SAMPLE_PHOTOS.slice(0, Math.max(1, Math.min(MIN_PHOTOS, MAX_PHOTOS - photos.length)))} onPicked={add} />
      <BottomSheet visible={videoSheet} onClose={() => setVideoSheet(false)} title="Video presentation" subtitle="A short vertical video where you introduce yourself to employers." closable>
        <View style={{ backgroundColor: c.input, borderRadius: 16, padding: 14, gap: 8 }}>
          {['30–60 seconds, vertical', 'Good light, face the camera', 'Name, experience, languages, when you can work'].map((t) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={16} color="successText" />
              <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
                {t}
              </Text>
            </View>
          ))}
        </View>
        <Button label="Record video" icon="camera" onPress={() => (setVideoSheet(false), router.push('/signup/video-record'))} />
        <Button
          variant="neutral"
          label="Choose from gallery"
          icon="image"
          onPress={async () => {
            setVideoSheet(false);
            const v = await pickVideo();
            if (v) {
              const sec = Math.round((v.duration ?? 42000) / 1000);
              setSeeker({ video: { poster: VIDEO_POSTER, duration: `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, progress: 0 } });
            }
          }}
        />
      </BottomSheet>
    </FormScreen>
  );
}
