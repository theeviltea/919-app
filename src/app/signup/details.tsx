import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { appearanceTypes, clothingSizes, fieldByKey, genres, hairColors, shoeSizes } from '@/data/registration';
import { useSignup, type FieldEntry } from '@/data/signup';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

type Sel = { key: string; label: string; options: string[] };
const looksLikeLink = (s: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(s.trim());

/** Seeker sign-up, step 3 — questionnaire for the chosen field (body, model, music or service). */
export default function Details() {
  const { c } = useTheme();
  const { second } = useLocalSearchParams<{ second?: string }>();
  const idx = second ? 1 : 0;
  const { seeker, setSeeker } = useSignup();
  const entry = seeker.occupations[idx];
  const [d, setD] = useState<Record<string, string>>(entry?.details ?? {});
  const [links, setLinks] = useState<string[]>(entry?.links.length ? entry.links : ['']);
  const [tattoos, setTattoos] = useState(!!entry?.tattoos);
  const [piercing, setPiercing] = useState(!!entry?.piercing);
  const [sheet, setSheet] = useState<Sel | null>(null);

  if (!entry) {
    router.replace('/signup/occupation');
    return null;
  }
  const f = fieldByKey(entry.field);
  const form = f.form;
  const role = entry.roles[0];

  const num = (key: string, label: string, required = true) => (
    <Field
      key={key}
      label={label}
      required={required}
      value={d[key] ?? ''}
      onChangeText={(v) => setD({ ...d, [key]: v.replace(/\D/g, '').slice(0, 3) })}
      placeholder="Enter"
      keyboardType="number-pad"
      inputMode="numeric"
    />
  );
  const sel = (s: Sel, required = true) => (
    <Field key={s.key} label={s.label} required={required} value={d[s.key]} placeholder="Select" onPress={() => setSheet(s)} rightIcon="chevron-down" />
  );

  const body = form === 'model' || form === 'body';
  const required = body
    ? ['height', 'weight', ...(form === 'model' ? ['bust', 'waist', 'hips'] : []), 'clothing', 'shoe', 'hair', 'appearance']
    : form === 'music'
      ? ['genre']
      : [];
  const linksOk = links.every((l) => !l.trim() || looksLikeLink(l));
  const ok = required.every((k) => d[k]) && linksOk;

  const save = () => {
    const next: FieldEntry = { ...entry, details: d, links: links.filter((l) => l.trim()), tattoos, piercing };
    setSeeker((s) => {
      const occ = [...s.occupations];
      occ[idx] = next;
      return { occupations: occ };
    });
    router.push(second ? '/signup/review' : '/signup/media');
  };

  const title = form === 'model' ? 'Model details' : form === 'music' ? 'Musician details' : `${role} details`;
  const subtitle =
    form === 'model'
      ? 'Employers filter castings by these. Fields marked * are required.'
      : form === 'music'
        ? 'Show employers what you play. Fields marked * are required.'
        : form === 'service'
          ? `${f.label} · ${role}. Employers look at your previous work first.`
          : `${f.label} · ${role}. Employers filter candidates by these. Fields marked * are required.`;

  return (
    <FormScreen top={<StepProgress step={3} of={5} />} title={title} subtitle={subtitle} footer={<Button size="l" label="Continue" disabled={!ok} onPress={save} />}>
      {body ? (
        <View style={{ gap: 8 }}>
          {num('height', 'Height, cm')}
          {num('weight', 'Weight, kg')}
          {form === 'model' ? [num('bust', 'Bust, cm'), num('waist', 'Waist, cm'), num('hips', 'Hips, cm')] : null}
          {sel({ key: 'clothing', label: 'Clothing size', options: clothingSizes })}
          {sel({ key: 'shoe', label: 'Shoe size, EU', options: shoeSizes })}
          {sel({ key: 'hair', label: 'Hair color', options: hairColors })}
          {sel({ key: 'appearance', label: 'Appearance type', options: appearanceTypes })}
          <Text variant="bodyS" color="textBody" style={{ marginTop: 8 }}>
            Tattoos and piercing · tap what applies
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Tattoos" check selected={tattoos} onPress={() => setTattoos(!tattoos)} />
            <Chip label="Piercing" check selected={piercing} onPress={() => setPiercing(!piercing)} />
          </View>
        </View>
      ) : null}

      {form === 'service' ? (
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.primarySecondary }}>
          <Icon name="sparkles" size={20} color="link" />
          <Text variant="body" color="link" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            Service roles don’t need body measurements. Show your work instead — it’s optional, you can add it later.
          </Text>
        </View>
      ) : null}
      {form === 'music' ? sel({ key: 'genre', label: 'Genre', options: genres }) : null}

      {form === 'music' || form === 'service' ? (
        <View style={{ gap: 8 }}>
          {links.map((l, i) => (
            <Field
              key={i}
              label={form === 'music' ? 'Promo link' : 'Portfolio link'}
              value={l}
              onChangeText={(v) => setLinks(links.map((x, j) => (j === i ? v : x)))}
              placeholder={form === 'music' ? 'youtube.com, soundcloud.com…' : 'instagram.com, behance.net…'}
              autoCapitalize="none"
              keyboardType="url"
              error={l.trim() && !looksLikeLink(l) ? 'Paste a full link, e.g. soundcloud.com/you' : undefined}
              right={
                l.trim() && looksLikeLink(l) ? (
                  <Icon name="check" size={18} color="successText" />
                ) : links.length > 1 ? (
                  <Pressable onPress={() => setLinks(links.filter((_, j) => j !== i))} accessibilityLabel="Remove link" hitSlop={8}>
                    <Icon name="cancel" size={18} color="textBody" />
                  </Pressable>
                ) : null
              }
            />
          ))}
          {links.length < 3 ? (
            <Pressable
              onPress={() => setLinks([...links, ''])}
              accessibilityRole="button"
              style={{ height: 44, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="add" size={18} color="link" />
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                Add another link · up to 3
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <SelectSheet
        visible={!!sheet}
        title={sheet?.label ?? ''}
        options={sheet?.options}
        value={sheet ? d[sheet.key] : undefined}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          if (sheet) setD({ ...d, [sheet.key]: v });
          setSheet(null);
        }}
      />
    </FormScreen>
  );
}
