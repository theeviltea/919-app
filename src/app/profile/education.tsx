import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Text, Toggle, useToast } from '@/components';
import { useSeeker, type Study } from '@/data/seeker';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { DangerTonal, Panel, SubScreen } from '@/features/profile/ui';

const DEGREES = ['Courses', 'School', 'Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD'];
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() + 4 - i));
type Sheet = 'degree' | 'start' | 'end' | null;
let seq = 0;

/** Add or edit one education entry. */
export default function Education() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const toast = useToast();
  const { profile, updateProfile } = useSeeker();
  const existing = profile.education.find((e) => e.id === id);
  const [e, setE] = useState<Partial<Study>>(existing ?? { current: false, field: '' });
  const [sheet, setSheet] = useState<Sheet>(null);
  const set = (u: Partial<Study>) => setE((x) => ({ ...x, ...u }));
  const endErr = !e.current && e.start && e.end && e.end < e.start ? 'Can’t be before the start year' : undefined;
  const ok = !!(e.institution?.trim() && e.degree && e.start && (e.current || e.end) && !endErr);

  const save = () => {
    const s = { ...e, id: existing?.id ?? `e${Date.now()}${++seq}`, institution: e.institution!.trim(), field: (e.field ?? '').trim(), end: e.current ? undefined : e.end } as Study;
    const list = existing ? profile.education.map((x) => (x.id === s.id ? s : x)) : [s, ...profile.education];
    list.sort((a, b) => b.start - a.start);
    updateProfile({ education: list });
    toast({ text: existing ? 'Education updated' : 'Education added', icon: 'check', aboveTabBar: true });
    router.back();
  };
  const remove = () => {
    updateProfile({ education: profile.education.filter((x) => x.id !== existing?.id) });
    toast({ text: 'Education deleted', kind: 'neutral', icon: 'trash', aboveTabBar: true });
    router.back();
  };

  return (
    <SubScreen title="Education" footer={<Button size="l" label="Save" disabled={!ok} onPress={save} />}>
      <Panel title="Where you studied" gap={8}>
        <Field onSurface label="Institution" required value={e.institution ?? ''} onChangeText={(v) => set({ institution: v })} placeholder="College, school or academy" />
        <Field onSurface label="Degree" required value={e.degree} placeholder="Select" onPress={() => setSheet('degree')} rightIcon="chevron-down" />
        <Field onSurface label="Field of study" value={e.field ?? ''} onChangeText={(v) => set({ field: v })} placeholder="Hospitality management" />
      </Panel>

      <Panel title="Years" gap={8}>
        <Field onSurface label="Start year" required value={e.start ? String(e.start) : undefined} placeholder="Select" onPress={() => setSheet('start')} rightIcon="chevron-down" />
        <Field
          onSurface
          label="End year"
          required={!e.current}
          disabled={e.current}
          value={e.current ? 'Present' : e.end ? String(e.end) : undefined}
          placeholder="Select"
          error={endErr}
          onPress={e.current ? undefined : () => setSheet('end')}
          rightIcon="chevron-down"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingHorizontal: 2 }}>
          <Text variant="body" weight={600} style={{ flex: 1, fontSize: 15 }}>
            I still study here
          </Text>
          <Toggle value={!!e.current} onValueChange={(v) => set({ current: v })} accessibilityLabel="I still study here" />
        </View>
      </Panel>

      {existing ? <DangerTonal label="Delete this education" onPress={remove} /> : null}

      <SelectSheet visible={sheet === 'degree'} title="Degree" options={DEGREES} value={e.degree} onClose={() => setSheet(null)} onSelect={(v) => (set({ degree: v }), setSheet(null))} />
      <SelectSheet visible={sheet === 'start'} title="Start year" options={YEARS.slice(4)} value={e.start ? String(e.start) : undefined} onClose={() => setSheet(null)} onSelect={(v) => (set({ start: Number(v) }), setSheet(null))} />
      <SelectSheet visible={sheet === 'end'} title="End year" options={YEARS} value={e.end ? String(e.end) : undefined} onClose={() => setSheet(null)} onSelect={(v) => (set({ end: Number(v) }), setSheet(null))} />
    </SubScreen>
  );
}
