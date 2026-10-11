import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Field, Icon, Text, useToast } from '@/components';
import { appearanceTypes, clothingSizes, fieldByKey, genres, hairColors, shoeSizes, type Field as FieldKey } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { DangerTonal, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Sel = { key: string; label: string; options: string[] };

/** Questionnaire of one occupation (Model business, Hospitality…), edited from Professional. */
export default function FieldDetails() {
  const { field, fresh } = useLocalSearchParams<{ field: FieldKey; fresh?: string }>();
  const { c } = useTheme();
  const toast = useToast();
  const { seeker, setSeeker } = useSignup();
  const entry = seeker.occupations.find((o) => o.field === field);
  const [d, setD] = useState<Record<string, string>>(entry?.details ?? {});
  const [tattoos, setTattoos] = useState(!!entry?.tattoos);
  const [piercing, setPiercing] = useState(!!entry?.piercing);
  const [sheet, setSheet] = useState<Sel | null>(null);
  const [confirm, setConfirm] = useState(false);

  if (!entry) return null;
  const f = fieldByKey(entry.field);
  const form = f.form;
  const body = form === 'model' || form === 'body';
  const required = body ? ['weight', 'height', ...(form === 'model' ? ['bust', 'waist', 'hips'] : []), 'clothing', 'shoe', 'hair', 'appearance'] : form === 'music' ? ['genre'] : [];
  const ok = required.every((k) => d[k]);

  const num = (key: string, label: string) => (
    <Field key={key} label={label} required value={d[key] ?? ''} onChangeText={(v) => setD({ ...d, [key]: v.replace(/\D/g, '').slice(0, 3) })} placeholder="Enter" keyboardType="number-pad" inputMode="numeric" />
  );
  const sel = (s: Sel, req = true) => <Field key={s.key} label={s.label} required={req} value={d[s.key]} placeholder="Select" onPress={() => setSheet(s)} rightIcon="chevron-down" />;
  const yesNo = (key: 'tattoos' | 'piercing', label: string, v: boolean) => (
    <Field key={key} label={label} value={v ? 'Yes' : 'No'} onPress={() => setSheet({ key, label, options: ['Yes', 'No'] })} rightIcon="chevron-down" />
  );

  const save = () => {
    setSeeker((s) => ({ occupations: s.occupations.map((o) => (o.field === entry.field ? { ...o, details: d, tattoos, piercing } : o)) }));
    toast({ text: fresh ? `${f.label} added to your profile` : 'Changes saved', icon: 'check', aboveTabBar: true });
    router.back();
  };
  const remove = () => {
    setConfirm(false);
    setSeeker((s) => ({ occupations: s.occupations.filter((o) => o.field !== entry.field) }));
    toast({ text: `${f.label} removed`, kind: 'neutral', icon: 'trash', aboveTabBar: true });
    router.back();
  };

  const intro =
    form === 'model'
      ? 'These details show in your profile and help employers find you for castings.'
      : form === 'music'
        ? 'Show employers what you play. Promo links live in Portfolio and socials.'
        : form === 'service'
          ? 'Service roles don’t need measurements. Add your work in Portfolio and socials.'
          : 'Employers filter candidates by these. Fields marked * are required.';

  return (
    <SubScreen title={f.label} gap={14} footer={<Button size="l" label="Save changes" disabled={!ok} onPress={save} />}>
      <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
        {intro}
      </Text>
      {body ? (
        <View style={{ gap: 8 }}>
          {num('weight', 'Weight, kg')}
          {num('height', 'Height, cm')}
          {form === 'model' ? [num('bust', 'Bust, cm'), num('waist', 'Waist, cm'), num('hips', 'Hips, cm')] : null}
          {sel({ key: 'clothing', label: 'Clothing size', options: clothingSizes })}
          {sel({ key: 'shoe', label: 'Shoe size, EU', options: shoeSizes })}
          {yesNo('tattoos', 'Tattoos', tattoos)}
          {yesNo('piercing', 'Piercing', piercing)}
          {sel({ key: 'hair', label: 'Hair color', options: hairColors })}
          {sel({ key: 'appearance', label: 'Appearance type', options: appearanceTypes })}
        </View>
      ) : null}
      {form === 'music' ? sel({ key: 'genre', label: 'Genre', options: genres }) : null}
      {form === 'service' ? (
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.primarySecondary }}>
          <Icon name="sparkles" size={20} color="link" />
          <Text variant="body" color="link" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            Roles: {entry.roles.join(', ')}. Change them in Occupations.
          </Text>
        </View>
      ) : null}
      <DangerTonal label="Remove this occupation" disabled={seeker.occupations.length < 2} onPress={() => setConfirm(true)} />
      {seeker.occupations.length < 2 ? (
        <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13, marginTop: -6 }}>
          You need at least one occupation. Add another one first.
        </Text>
      ) : null}

      <SelectSheet
        visible={!!sheet}
        title={sheet?.label ?? ''}
        options={sheet?.options}
        value={sheet ? (sheet.key === 'tattoos' ? (tattoos ? 'Yes' : 'No') : sheet.key === 'piercing' ? (piercing ? 'Yes' : 'No') : d[sheet.key]) : undefined}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          if (sheet?.key === 'tattoos') setTattoos(v === 'Yes');
          else if (sheet?.key === 'piercing') setPiercing(v === 'Yes');
          else if (sheet) setD({ ...d, [sheet.key]: v });
          setSheet(null);
        }}
      />
      <BottomSheet visible={confirm} onClose={() => setConfirm(false)} title={`Remove ${f.label}?`} subtitle="Employers won’t find you for these roles anymore. You can add it again later.">
        <Button variant="danger" label="Remove" onPress={remove} />
        <Button variant="neutral" label="Cancel" onPress={() => setConfirm(false)} />
      </BottomSheet>
    </SubScreen>
  );
}
