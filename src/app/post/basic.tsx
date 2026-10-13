import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { mockImg } from '@/data/mock';
import { allCountries, citiesFor, countryCode, popularCountryNames } from '@/data/registration';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { dotDate, useDraft } from '@/features/post/draft';
import { Panel } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const MAX_DESC = 1000;
const MAX_PHOTOS = 10;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Next 60 days for the start date ("Today", "Tomorrow", then "Thu, 16 Oct"). */
const startDates = Array.from({ length: 60 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    iso: iso(d),
    label: i === 0 ? `Today, ${d.getDate()} ${MONTHS[d.getMonth()]}` : i === 1 ? `Tomorrow, ${d.getDate()} ${MONTHS[d.getMonth()]}` : `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`,
  };
});
const SAMPLE_COVERS = [mockImg.burj, mockImg.madinat, mockImg.dubai2];
const SAMPLE_PHOTOS = [mockImg.misc, mockImg.dubai1, mockImg.madinat, mockImg.promo, mockImg.band];

type Sheet = 'cover' | 'photos' | 'date' | 'country' | 'city' | null;

/** New vacancy, step 2 of 4 — Basic information (VacBasic / VacBasicFilled). */
export default function VacancyBasic() {
  const { c } = useTheme();
  const { d, set } = useDraft();
  const [sheet, setSheet] = useState<Sheet>(null);
  const ok = !!d.cover && d.title.trim().length >= 3 && d.description.trim().length >= 20 && !!d.startDate && !!d.country && !!d.city && d.photos.length > 0;
  const dateLabel = startDates.find((x) => x.iso === d.startDate)?.label;

  return (
    <FormScreen
      top={<StepProgress label="New vacancy" step={2} of={4} />}
      title="Basic information"
      subtitle="Fill in all the fields — this is what candidates see first."
      footer={<Button size="l" label="Proceed" disabled={!ok} onPress={() => router.push('/post/salary')} />}>
      <Panel title="Cover">
        {d.cover ? (
          <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: c.backDarker }}>
            <Image source={d.cover} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            <Pressable
              onPress={() => setSheet('cover')}
              accessibilityRole="button"
              style={{
                position: 'absolute',
                right: 10,
                bottom: 10,
                height: 36,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: 'rgba(24,25,27,0.7)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}>
              <Icon name="camera" size={16} color="#FFFFFF" />
              <Text variant="bodyS" weight={700} color="#FFFFFF" style={{ fontSize: 13 }}>
                Change cover
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setSheet('cover')}
            accessibilityRole="button"
            accessibilityLabel="Upload cover"
            style={{
              height: 180,
              borderRadius: 16,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: c.placeholderDashed,
              backgroundColor: c.surfaceInset,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image" size={24} color="primary" />
            </View>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Upload cover *
            </Text>
            <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
              JPG or PNG, landscape 16:9
            </Text>
          </Pressable>
        )}
      </Panel>

      <Panel title="Details" gap={8}>
        <Field onSurface label="Title" required value={d.title} onChangeText={(v) => set({ title: v })} placeholder="Enter" maxLength={80} />
        <Field
          onSurface
          label="Description"
          required
          value={d.description}
          onChangeText={(v) => set({ description: v })}
          multiline
          maxLength={MAX_DESC}
          counter
          placeholder="Tell candidates about the job, the venue and the schedule"
        />
        <Field onSurface label="Start date" required value={d.startDate ? dotDate(d.startDate) : undefined} placeholder="Select" onPress={() => setSheet('date')} rightIcon="calendar" />
      </Panel>

      <Panel title="Location" gap={8}>
        <Field onSurface label="Country" required value={d.country} onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field onSurface label="City" required value={d.city} placeholder="Select" onPress={() => setSheet('city')} rightIcon="chevron-down" />
      </Panel>

      <Panel gap={12}>
        <View style={{ gap: 2 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            Photos *
          </Text>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            {d.photos.length ? `${d.photos.length} of ${MAX_PHOTOS}` : `Add at least 1 photo, up to ${MAX_PHOTOS}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
          {d.photos.map((ph, i) => (
            <View key={i} style={{ width: '33.333%', padding: 4 }}>
              <View style={{ height: 100, borderRadius: 14, overflow: 'hidden', backgroundColor: c.backDarker }}>
                <Image source={ph} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                <Pressable
                  onPress={() => set({ photos: d.photos.filter((_, k) => k !== i) })}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${i + 1}`}
                  hitSlop={6}
                  style={{ position: 'absolute', right: 6, top: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(24,25,27,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="cancel" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          ))}
          {d.photos.length < MAX_PHOTOS ? (
            <View style={{ width: '33.333%', padding: 4 }}>
              <Pressable
                onPress={() => setSheet('photos')}
                accessibilityRole="button"
                style={{
                  height: 100,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: c.placeholderDashed,
                  backgroundColor: c.surfaceInset,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}>
                <Icon name="camera" size={20} color="textHeadline" />
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  Add photo
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Panel>

      <PhotoSheet
        visible={sheet === 'cover'}
        title="Vacancy cover"
        onClose={() => setSheet(null)}
        sample={SAMPLE_COVERS[d.title.length % SAMPLE_COVERS.length]}
        onPicked={([p]) => p && set({ cover: p })}
      />
      <PhotoSheet
        visible={sheet === 'photos'}
        title="Add photos"
        multiple
        limit={MAX_PHOTOS - d.photos.length}
        onClose={() => setSheet(null)}
        sample={SAMPLE_PHOTOS.slice(0, Math.max(1, Math.min(3, MAX_PHOTOS - d.photos.length)))}
        onPicked={(ps) => set({ photos: [...d.photos, ...ps].slice(0, MAX_PHOTOS) })}
      />
      <SelectSheet
        visible={sheet === 'date'}
        title="Start date"
        options={startDates.map((x) => x.label)}
        value={dateLabel ?? ''}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ startDate: startDates.find((x) => x.label === v)?.iso }), setSheet(null))}
      />
      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[
          { title: 'POPULAR', items: popularCountryNames },
          { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) },
        ]}
        badge={(x) => countryCode[x] ?? x.slice(0, 2).toUpperCase()}
        value={d.country}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ country: v, city: v === d.country ? d.city : '' }), setSheet(null))}
      />
      <SelectSheet visible={sheet === 'city'} title="City" options={citiesFor(d.country)} value={d.city} onClose={() => setSheet(null)} onSelect={(v) => (set({ city: v }), setSheet(null))} />
    </FormScreen>
  );
}
