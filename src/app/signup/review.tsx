import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, Icon, IconButton, Pressable, StatusChip, StepProgress, Text } from '@/components';
import { ageFrom, fieldByKey, occupationRows } from '@/data/registration';
import { useSignup, type FieldEntry } from '@/data/signup';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { useTheme } from '@/theme';

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 9, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <Text variant="body" color="textBody" style={{ flex: 1, fontSize: 14 }}>
        {label}
      </Text>
      <Text variant="body" weight={600} style={{ fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}

function OccupationCard({ e, onEdit }: { e: FieldEntry; onEdit: () => void }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(true);
  const f = fieldByKey(e.field);
  const rows = occupationRows(e);

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1 }}>
          {f.label}
        </Text>
        <StatusChip kind="success" label="Complete" icon="check" />
        <IconButton icon="edit" label={`Edit ${f.label}`} tone="filled" size={36} onPress={onEdit} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {e.roles.map((r) => (
          <View key={r} style={{ height: 28, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.inverse, justifyContent: 'center' }}>
            <Text variant="bodyS" weight={600} color="onInverse">
              {r}
            </Text>
          </View>
        ))}
      </View>
      {rows.length ? (
        <>
          {open ? <View>{rows.map(([l, v], i) => <Row key={l} label={l} value={v} last={i === rows.length - 1} />)}</View> : null}
          <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
              {open ? 'Hide details' : 'Show details'}
            </Text>
            <Icon name="chevron-down" size={16} color="link" />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

/** Seeker sign-up, step 5 — check the profile, add a second field, Finish. */
export default function Review() {
  const { c } = useTheme();
  const { seeker: s } = useSignup();
  const finish = useFinishAuth();
  const age = ageFrom(s.dob);

  return (
    <FormScreen
      top={<StepProgress step={5} of={5} />}
      title="Check your profile"
      subtitle="This is what employers will see. You can edit it any time."
      footer={<Button size="l" label="Finish" onPress={() => finish({ role: 'seeker', firstName: s.firstName })} />}>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', backgroundColor: c.avatar1 }}>
          {s.photo ? <Image source={s.photo} contentFit="cover" style={{ width: 56, height: 56 }} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="displayM">
            {s.firstName} {s.lastName}
          </Text>
          <Text variant="bodyS" color="textBody" style={{ marginTop: 2 }}>
            {[age ? `${age} years` : null, s.gender, s.city].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <IconButton icon="edit" label="Edit about you" tone="filled" size={36} onPress={() => router.navigate('/auth/about')} />
      </View>

      {s.occupations.map((e, i) => (
        <OccupationCard key={e.field} e={e} onEdit={() => router.navigate({ pathname: '/signup/details', params: i ? { second: '1' } : {} })} />
      ))}
      {s.occupations.length < 2 ? (
        <Pressable
          onPress={() => router.push({ pathname: '/signup/occupation', params: { second: '1' } })}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="add" size={18} color="link" />
          <Text variant="body" weight={700} color="link">
            Add a second occupation
          </Text>
        </Pressable>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1 }}>
          Photos
        </Text>
        <Pressable onPress={() => router.navigate('/signup/media')} accessibilityRole="button">
          <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
            Edit
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {s.photos.map((p) => (
          <Image key={p.id} source={p.source} contentFit="cover" style={{ width: '31.5%', aspectRatio: 1, borderRadius: 16, backgroundColor: c.backDarker }} />
        ))}
      </View>
      {s.video ? (
        <>
          <Text variant="bodyL" weight={700}>
            Video presentation
          </Text>
          <View style={{ height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: c.mediaBlack }}>
            <Image source={s.video.poster} contentFit="contain" style={{ width: '100%', height: '100%' }} />
            <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={22} color="#18191C" />
              </View>
            </View>
            <View style={{ position: 'absolute', left: 12, bottom: 12, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.mediaOverlay, justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="#FFFFFF">
                {s.video.progress !== undefined ? `Uploading ${s.video.progress}%` : s.video.duration}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.infoBack }}>
          <Icon name="video" size={20} color="infoText" />
          <Text variant="body" color="infoText" style={{ flex: 1, fontSize: 14 }}>
            No video yet. Profiles with a video presentation get 3× more replies — you can add it later.
          </Text>
        </View>
      )}
    </FormScreen>
  );
}
