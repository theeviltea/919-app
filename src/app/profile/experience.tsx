import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Text, Toggle, useToast } from '@/components';
import { spheres, vacancySpheres } from '@/data/dictionaries';
import { citiesFor } from '@/data/registration';
import { fmtYM, useSeeker, type Job } from '@/data/seeker';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { MonthSheet } from '@/features/profile/MonthSheet';
import { DangerTonal, Panel, SubScreen } from '@/features/profile/ui';

type Sheet = 'city' | 'category' | 'start' | 'end' | null;
let seq = 0;

/** Add or edit one job. Opened from Professional (⋯ on an entry, or Add experience). */
export default function Experience() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const toast = useToast();
  const { profile, updateProfile } = useSeeker();
  const existing = profile.experience.find((j) => j.id === id);
  const [j, setJ] = useState<Partial<Job>>(existing ?? { city: profile.city, current: false, description: '' });
  const [sheet, setSheet] = useState<Sheet>(null);
  const set = (u: Partial<Job>) => setJ((x) => ({ ...x, ...u }));
  const cities = citiesFor(profile.country ?? 'United Arab Emirates');
  const ok = !!(j.role?.trim() && j.company?.trim() && j.city && j.category && j.start && (j.current || j.end));

  const save = () => {
    const job = { ...j, id: existing?.id ?? `x${Date.now()}${++seq}`, role: j.role!.trim(), company: j.company!.trim(), end: j.current ? undefined : j.end } as Job;
    const list = existing ? profile.experience.map((x) => (x.id === job.id ? job : x)) : [job, ...profile.experience];
    // Newest first: current jobs, then by start date.
    list.sort((a, b) => Number(b.current) - Number(a.current) || b.start.y * 12 + b.start.m - (a.start.y * 12 + a.start.m));
    updateProfile({ experience: list });
    toast({ text: existing ? 'Experience updated' : 'Experience added', icon: 'check', aboveTabBar: true });
    router.back();
  };
  const remove = () => {
    updateProfile({ experience: profile.experience.filter((x) => x.id !== existing?.id) });
    toast({ text: 'Experience deleted', kind: 'neutral', icon: 'trash', aboveTabBar: true });
    router.back();
  };

  return (
    <SubScreen title="Experience" footer={<Button size="l" label="Save" disabled={!ok} onPress={save} />}>
      <Panel title="Position" gap={8}>
        <Field onSurface label="Job title" required value={j.role ?? ''} onChangeText={(v) => set({ role: v })} placeholder="Hostess, waiter, DJ…" />
        <Field onSurface label="Company or venue" required value={j.company ?? ''} onChangeText={(v) => set({ company: v })} placeholder="Atlantis The Palm" />
        <Field onSurface label="City" required value={j.city} placeholder="Select" onPress={() => setSheet('city')} rightIcon="chevron-down" />
        <Field onSurface label="Category" required value={j.category} placeholder="Select" onPress={() => setSheet('category')} rightIcon="chevron-down" />
      </Panel>

      <Panel title="Period" gap={8}>
        <Field onSurface label="Start" required value={fmtYM(j.start ? { ...j.start, d: undefined } : undefined)} placeholder="Month and year" onPress={() => setSheet('start')} rightIcon="calendar" />
        <Field
          onSurface
          label="End"
          required={!j.current}
          disabled={j.current}
          value={j.current ? 'Present' : fmtYM(j.end ? { ...j.end, d: undefined } : undefined)}
          placeholder="Month and year"
          onPress={j.current ? undefined : () => setSheet('end')}
          rightIcon="calendar"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingHorizontal: 2 }}>
          <Text variant="body" weight={600} style={{ flex: 1, fontSize: 15 }}>
            I currently work here
          </Text>
          <Toggle value={!!j.current} onValueChange={(v) => set({ current: v })} accessibilityLabel="I currently work here" />
        </View>
      </Panel>

      <Panel title="What you did" gap={8}>
        <Field onSurface label="Duties and achievements (optional)" multiline maxLength={500} value={j.description ?? ''} onChangeText={(v) => set({ description: v })} placeholder="What you were responsible for, numbers, guests, events" />
        <Text variant="caption" weight={400} color="textBody" align="right">
          {(j.description ?? '').length} / 500
        </Text>
      </Panel>

      {existing ? <DangerTonal label="Delete this experience" onPress={remove} /> : null}

      <SelectSheet visible={sheet === 'city'} title="City" searchPlaceholder="Search city" options={cities.length ? cities : ['Dubai']} value={j.city} onClose={() => setSheet(null)} onSelect={(v) => (set({ city: v }), setSheet(null))} />
      <SelectSheet visible={sheet === 'category'} title="Category" options={vacancySpheres.map((s) => spheres[s])} value={j.category} onClose={() => setSheet(null)} onSelect={(v) => (set({ category: v }), setSheet(null))} />
      <MonthSheet visible={sheet === 'start'} title="Start month" value={j.start} onClose={() => setSheet(null)} onSelect={(v) => (set({ start: v, end: j.end && v.y * 12 + v.m > j.end.y * 12 + j.end.m ? undefined : j.end }), setSheet(null))} />
      <MonthSheet visible={sheet === 'end'} title="End month" value={j.end} min={j.start} onClose={() => setSheet(null)} onSelect={(v) => (set({ end: v }), setSheet(null))} />
    </SubScreen>
  );
}
