import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { useSeeker, type LangLevel, type Language } from '@/data/seeker';
import { useSignup } from '@/data/signup';
import { MAX_PHOTOS, SAMPLE_PHOTOS } from '@/features/auth/media';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { VideoSheet } from '@/features/auth/VideoSheet';
import { openPhotos } from '@/features/media/viewer';
import { CodeTile, DashedButton, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const LANGS: [string, string][] = [
  ['English', 'EN'], ['Arabic', 'AR'], ['Russian', 'RU'], ['French', 'FR'], ['Spanish', 'ES'], ['German', 'DE'], ['Italian', 'IT'], ['Portuguese', 'PT'],
  ['Turkish', 'TR'], ['Persian', 'FA'], ['Hindi', 'HI'], ['Urdu', 'UR'], ['Tagalog', 'TL'], ['Chinese', 'ZH'], ['Ukrainian', 'UK'], ['Kazakh', 'KK'], ['Uzbek', 'UZ'],
];
const LEVELS: LangLevel[] = ['Native', 'Fluent', 'Intermediate', 'Basic'];
let seq = 0;

/** General: photos (first is the cover), video presentation, About me and languages. */
export default function General() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile, updateProfile } = useSeeker();
  const { seeker, setSeeker } = useSignup();
  const [about, setAbout] = useState(profile.about);
  const [langs, setLangs] = useState<Language[]>(profile.languages);
  const [sheet, setSheet] = useState<'photo' | 'video' | 'lang' | { level: string } | null>(null);
  const photos = seeker.photos;
  const video = seeker.video;

  const addPhotos = (sources: Parameters<React.ComponentProps<typeof PhotoSheet>['onPicked']>[0]) =>
    setSeeker((s) => ({ photos: [...s.photos, ...sources.slice(0, MAX_PHOTOS - s.photos.length).map((source) => ({ id: `g${++seq}`, source, progress: 0 }))] }));
  const makeCover = (id: string) => {
    setSeeker((s) => ({ photos: [...s.photos.filter((x) => x.id === id), ...s.photos.filter((x) => x.id !== id)] }));
    toast({ text: 'Cover photo changed', icon: 'check', aboveTabBar: true });
  };

  const save = () => {
    updateProfile({ about: about.trim(), languages: langs });
    toast({ text: 'Changes saved', icon: 'check', aboveTabBar: true });
    router.back();
  };

  return (
    <SubScreen title="General" footer={<Button size="l" label="Save changes" onPress={save} />}>
      <Panel
        title="Photos"
        right={
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            {photos.length} / {MAX_PHOTOS}
          </Text>
        }>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
          {photos.map((ph, i) => (
            <View key={ph.id} style={{ width: '33.333%', padding: 4 }}>
              <Pressable onPress={() => openPhotos({ photos: photos.map((x) => x.source), index: i })} onLongPress={() => i && makeCover(ph.id)} delayLongPress={350} accessibilityHint={i ? 'Long press to make it the cover' : undefined} style={{ height: 132, borderRadius: 14, overflow: 'hidden', backgroundColor: c.avatar1 }}>
                <Image source={ph.source} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} />
                {ph.progress !== undefined ? (
                  <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(24,25,27,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text variant="bodyS" weight={700} color="#FFFFFF">
                      {ph.progress}%
                    </Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => setSeeker((s) => ({ photos: s.photos.filter((x) => x.id !== ph.id) }))}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  hitSlop={6}
                  style={{ position: 'absolute', right: 6, top: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(24,25,27,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="cancel" size={14} color="#FFFFFF" />
                </Pressable>
                {i === 0 ? (
                  <View style={{ position: 'absolute', left: 6, bottom: 6, height: 20, paddingHorizontal: 6, borderRadius: 999, backgroundColor: 'rgba(24,25,27,0.7)', justifyContent: 'center' }}>
                    <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 11, lineHeight: 14 }}>
                      Cover
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <View style={{ width: '33.333%', padding: 4 }}>
              <Pressable
                onPress={() => setSheet('photo')}
                accessibilityRole="button"
                style={{ height: 132, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="add" size={22} color="link" />
                <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
                  Add photo
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
          Tap to view, hold to make it your cover. The first one is shown in search.
        </Text>
      </Panel>

      <Panel title="Video presentation">
        {video ? (
          <>
            <View style={{ height: 190, borderRadius: 18, overflow: 'hidden', backgroundColor: '#232426', alignItems: 'center' }}>
              <Image source={video.poster} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 124, height: 190, backgroundColor: '#2C2140' }} />
              {video.progress !== undefined ? (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(24,25,27,0.55)', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text variant="body" weight={700} color="#FFFFFF">
                    Uploading {video.progress}%
                  </Text>
                  <View style={{ width: 140, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                    <View style={{ width: `${video.progress}%`, height: 4, borderRadius: 2, backgroundColor: c.primary }} />
                  </View>
                </View>
              ) : (
                <View style={{ position: 'absolute', top: 69, width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="play" size={22} color="#18191C" />
                </View>
              )}
              <View style={{ position: 'absolute', left: 10, bottom: 10, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(24,25,27,0.7)', justifyContent: 'center' }}>
                <Text variant="caption" weight={600} color="#FFFFFF">
                  {video.duration}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => setSheet('video')} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                  Replace
                </Text>
              </Pressable>
              <Pressable onPress={() => setSeeker({ video: undefined })} accessibilityRole="button" style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 15 }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            onPress={() => setSheet('video')}
            accessibilityRole="button"
            style={{ height: 120, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: c.placeholderDashed, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="video" size={24} color="link" />
            <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
              Add video presentation
            </Text>
            <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
              Up to 60 seconds · profiles with video get 3× more replies
            </Text>
          </Pressable>
        )}
      </Panel>

      <Panel title="About me" gap={8}>
        <Field onSurface label="A few lines about you" multiline maxLength={500} value={about} onChangeText={setAbout} placeholder="Where you worked, what you’re best at, when you can work" />
        <Text variant="caption" weight={400} color="textBody" align="right">
          {about.length} / 500
        </Text>
      </Panel>

      <Panel title="Languages" gap={0}>
        <View style={{ marginTop: 6 }}>
          {langs.map((l, i) => (
            <View key={l.code} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < langs.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <CodeTile code={l.code} />
              <Text variant="body" style={{ flex: 1, fontSize: 15 }}>
                {l.name}
              </Text>
              <Pressable
                onPress={() => setSheet({ level: l.code })}
                accessibilityRole="button"
                accessibilityLabel={`${l.name} level: ${l.level}`}
                style={{ height: 36, paddingHorizontal: 10, borderRadius: 12, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                  {l.level}
                </Text>
                <Icon name="chevron-down" size={14} color="textHeadline" />
              </Pressable>
              <Pressable onPress={() => setLangs(langs.filter((x) => x.code !== l.code))} accessibilityRole="button" accessibilityLabel={`Remove ${l.name}`} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cancel" size={18} color="textLightSecondary" />
              </Pressable>
            </View>
          ))}
        </View>
        <DashedButton label="Add language" onPress={() => setSheet('lang')} />
      </Panel>

      <PhotoSheet
        visible={sheet === 'photo'}
        title="Add photos"
        multiple
        limit={MAX_PHOTOS - photos.length}
        sample={SAMPLE_PHOTOS.slice(0, Math.max(1, Math.min(3, MAX_PHOTOS - photos.length)))}
        onClose={() => setSheet(null)}
        onPicked={(s) => (setSheet(null), addPhotos(s))}
      />
      <VideoSheet visible={sheet === 'video'} onClose={() => setSheet(null)} />
      <SelectSheet
        visible={sheet === 'lang'}
        title="Add language"
        searchPlaceholder="Search language"
        options={LANGS.map(([n]) => n).filter((n) => !langs.some((l) => l.name === n))}
        onClose={() => setSheet(null)}
        onSelect={(n) => {
          const code = LANGS.find(([x]) => x === n)?.[1] ?? n.slice(0, 2).toUpperCase();
          setLangs([...langs, { code, name: n, level: 'Fluent' }]);
          setSheet(null);
        }}
      />
      <SelectSheet
        visible={typeof sheet === 'object' && sheet !== null}
        title="Level"
        options={LEVELS}
        value={typeof sheet === 'object' && sheet ? langs.find((l) => l.code === sheet.level)?.level : undefined}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          if (typeof sheet === 'object' && sheet) setLangs(langs.map((l) => (l.code === sheet.level ? { ...l, level: v as LangLevel } : l)));
          setSheet(null);
        }}
      />
    </SubScreen>
  );
}
