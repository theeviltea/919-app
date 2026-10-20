import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Chip, Field, FormScreen, Icon, Pressable, StepProgress, Text, Toggle, useToast, type IconName } from '@/components';
import { useEmployer } from '@/data/employer';
import { fieldByKey } from '@/data/registration';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { lastSent, payPreview, useDraft, type LangReq, type ParamValue } from '@/features/post/draft';
import { AGES, detailFromDraft, LANGS, LEVELS, paramsFor, SEXES, type ParamDef } from '@/features/post/requirements';
import { Panel } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const summary = (p: ParamDef, v: ParamValue | undefined, langs: LangReq[]) => {
  if (p.kind === 'langs') return langs.map((l) => `${l.name} · ${l.level}`).join(', ');
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'string') return v;
  return '';
};

function Check({ on }: { on: boolean }) {
  const { c } = useTheme();
  return on ? (
    <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="check" size={14} color="ctaButtonText" />
    </View>
  ) : (
    <View style={{ width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: c.control, backgroundColor: c.surface }} />
  );
}

/** New vacancy, step 4 of 4 — Requirements (VacRequirements / Filled / Urgent + VacUrgentSheet). */
export default function VacancyRequirements() {
  const { c } = useTheme();
  const toast = useToast();
  const { d, set, reset, editing } = useDraft();
  const { addVacancy } = useEmployer();
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'sex' | 'age' | 'urgent' | { lang: number } | null>(null);
  const defs = paramsFor(d.field);
  const ticked = (k: string) => (k === 'languages' ? d.languages.length > 0 : d.params[k] !== undefined);
  const setParam = (k: string, v: ParamValue | undefined) => {
    const next = { ...d.params };
    if (v === undefined) delete next[k];
    else next[k] = v;
    set({ params: next });
  };
  const ok = !!d.sex && !!d.age;
  const langIndex = typeof sheet === 'object' && sheet ? sheet.lang : -1;

  const toggleRow = (p: ParamDef) => {
    if (ticked(p.key)) {
      // Untick: drop the value.
      if (p.kind === 'langs') set({ languages: [] });
      else setParam(p.key, undefined);
      if (open === p.key) setOpen(null);
      return;
    }
    if (p.kind === 'bool') return setParam(p.key, true);
    if (p.kind === 'langs') set({ languages: [{ name: 'English', level: 'Fluent' }] });
    else setParam(p.key, p.kind === 'chips' ? [] : '');
    setOpen(p.key);
  };
  const closeEditor = (p: ParamDef) => {
    const v = d.params[p.key];
    if (p.kind !== 'langs' && (v === '' || (Array.isArray(v) && !v.length))) setParam(p.key, undefined);
    setOpen(null);
  };

  const send = () => {
    const id = `nv${Date.now()}`;
    const pay = payPreview(d);
    const meta = `${d.field ? fieldByKey(d.field).label : 'Vacancy'} · ${pay}`;
    addVacancy({
      id,
      title: d.title.trim(),
      meta,
      cover: d.cover!,
      status: 'review',
      note: 'Sent just now',
      urgentLeft: d.urgent ? '24 h left' : undefined,
      detail: detailFromDraft(d, 'On review'),
    });
    lastSent.current = { id, title: d.title.trim(), city: d.city, pay, start: d.startDate, cover: d.cover };
    router.replace('/post/sent');
    reset();
  };

  return (
    <FormScreen
      top={editing ? undefined : <StepProgress label="New vacancy" step={4} of={4} />}
      title="Requirements"
      subtitle="Set what matters for this role. Everything else stays open."
      footer={
        editing ? (
          <Button size="l" label="Done" disabled={!ok} onPress={() => router.back()} />
        ) : (
          <Button size="l" label={d.urgent ? 'Send for review · $2.99 paid' : 'Send for review'} disabled={!ok} onPress={send} />
        )
      }>
      <Panel title="Mandatory" gap={8}>
        <Field onSurface label="Sex" required value={d.sex} onPress={() => setSheet('sex')} rightIcon="chevron-down" />
        <Field onSurface label="Age" required value={d.age} placeholder="Select" onPress={() => setSheet('age')} rightIcon="chevron-down" />
      </Panel>

      <Panel gap={0}>
        <View style={{ gap: 2, marginBottom: 6 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            Additional
          </Text>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Tick a parameter to set it
          </Text>
        </View>
        {defs.map((p, i) => {
          const on = ticked(p.key);
          const isOpen = open === p.key;
          const value = summary(p, d.params[p.key], d.languages);
          return (
            <View key={p.key} style={{ paddingVertical: 10, gap: 10, borderBottomWidth: i < defs.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <View style={{ minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => toggleRow(p)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={p.label} hitSlop={8}>
                  <Check on={on} />
                </Pressable>
                <Pressable onPress={() => (on ? (p.kind === 'bool' ? toggleRow(p) : setOpen(isOpen ? null : p.key)) : toggleRow(p))} style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight={on ? 700 : 500} style={{ fontSize: 15 }}>
                    {p.label}
                    {p.unit ? (
                      <Text variant="body" weight={400} color="textBody" style={{ fontSize: 15 }}>
                        {` (${p.unit})`}
                      </Text>
                    ) : null}
                  </Text>
                  {on && !isOpen && value ? (
                    <Text variant="bodyS" color="textBody" numberOfLines={2} style={{ marginTop: 2, fontSize: 13 }}>
                      {value}
                    </Text>
                  ) : null}
                </Pressable>
                {on && p.kind !== 'bool' ? (
                  <Pressable onPress={() => (isOpen ? closeEditor(p) : setOpen(p.key))} accessibilityRole="button" hitSlop={8}>
                    <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                      {isOpen ? 'Save' : 'Edit'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {isOpen && p.kind === 'number' ? (
                <View style={{ paddingLeft: 36 }}>
                  <Field
                    label={`${p.label}${p.unit ? `, ${p.unit}` : ''}`}
                    value={String(d.params[p.key] ?? '')}
                    onChangeText={(v) => setParam(p.key, v.replace(/\D/g, '').slice(0, 3))}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    autoFocus
                    onSubmitEditing={() => closeEditor(p)}
                  />
                </View>
              ) : null}
              {isOpen && p.kind === 'chips' ? (
                <View style={{ paddingLeft: 36, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {p.options!.map((o) => {
                    const cur = (d.params[p.key] as string[] | undefined) ?? [];
                    const sel = cur.includes(o);
                    return <Chip key={o} label={o} check selected={sel} onPress={() => setParam(p.key, sel ? cur.filter((x) => x !== o) : [...cur, o])} />;
                  })}
                </View>
              ) : null}
              {isOpen && p.kind === 'langs' ? (
                <View style={{ paddingLeft: 36, gap: 8 }}>
                  {d.languages.map((l, k) => (
                    <View key={`${l.name}${k}`} style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Field onSurface label="Language" value={l.name} onPress={() => setSheet({ lang: k })} rightIcon="chevron-down" />
                        </View>
                        <Pressable
                          onPress={() => set({ languages: d.languages.filter((_, j) => j !== k) })}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${l.name}`}
                          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="trash" size={20} color="dangerText" />
                        </Pressable>
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {LEVELS.map((lv) => (
                          <Chip key={lv} label={lv} check selected={l.level === lv} onPress={() => set({ languages: d.languages.map((x, j) => (j === k ? { ...x, level: lv } : x)) })} />
                        ))}
                      </View>
                    </View>
                  ))}
                  <Pressable
                    onPress={() => setSheet({ lang: d.languages.length })}
                    accessibilityRole="button"
                    style={{ height: 48, borderRadius: 16, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name="add" size={18} color="link" />
                    <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                      Add language
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </Panel>

      {/* Urgent hiring: bought for a published vacancy from its actions, not while editing */}
      {editing ? null : (
        <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="fire" size={20} color="onUrgent" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="bodyL" weight={700} style={{ fontSize: 16 }}>
                  Urgent hiring
                </Text>
                {!d.urgent ? (
                  <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
                    <Text variant="caption" weight={700} color="textPrimary" style={{ fontSize: 11 }}>
                      $2.99
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                {d.urgent ? 'Paid · 24 h from the moment it goes live' : 'One-time purchase · lasts 24 hours'}
              </Text>
            </View>
            <Toggle value={d.urgent} onValueChange={(v) => (v ? setSheet('urgent') : toast({ text: 'Urgent is already paid for this vacancy', icon: 'fire' }))} accessibilityLabel="Urgent hiring" />
          </View>
          <Text variant="bodyS" color="textPrimary" style={{ fontSize: 13, lineHeight: 19 }}>
            The vacancy is pinned to the top of the feed and search, gets a hot Urgent badge and appears in the Urgent tab of candidates’ filters.
          </Text>
          {d.urgent ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: c.successBack }}>
              <Icon name="check" size={16} color="successText" />
              <Text variant="bodyS" weight={700} color="successText" style={{ flex: 1, fontSize: 13 }}>
                Urgent is on. The 24 hours start after moderation.
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <SelectSheet visible={sheet === 'sex'} title="Sex" options={SEXES} value={d.sex} onClose={() => setSheet(null)} onSelect={(v) => (set({ sex: v }), setSheet(null))} />
      <SelectSheet visible={sheet === 'age'} title="Age" options={AGES} value={d.age ?? ''} onClose={() => setSheet(null)} onSelect={(v) => (set({ age: v }), setSheet(null))} />
      <SelectSheet
        visible={langIndex >= 0}
        title="Language"
        searchPlaceholder="Search language"
        options={LANGS.filter((l) => l === d.languages[langIndex]?.name || !d.languages.some((x) => x.name === l))}
        value={d.languages[langIndex]?.name ?? ''}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          const next = [...d.languages];
          next[langIndex] = { name: v, level: next[langIndex]?.level ?? 'Fluent' };
          set({ languages: next });
          setSheet(null);
        }}
      />

      {/* VacUrgentSheet */}
      <BottomSheet visible={sheet === 'urgent'} onClose={() => setSheet(null)}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="fire" size={30} color="onUrgent" />
          </View>
          <Text variant="title" align="center">
            Urgent hiring for 24 hours
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            “{d.title.trim() || 'Your vacancy'}” goes to the top and gets candidates’ attention first.
          </Text>
        </View>
        {(
          [
            ['sort', 'Top of every list', 'Pinned above other vacancies in the feed and search'],
            ['fire', 'Hot badge', 'An Urgent badge on the vacancy and its card'],
            ['filter', 'Urgent tab in filters', 'Candidates who need a shift now see it in a separate tab'],
          ] as [IconName, string, string][]
        ).map(([ic, t, s]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={ic} size={18} color="textHeadline" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                {t}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13, lineHeight: 18 }}>
                {s}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              One-time · 24 hours
            </Text>
            <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
              Starts when the vacancy goes live
            </Text>
          </View>
          <Text variant="displayM" style={{ fontSize: 20 }}>
            $2.99
          </Text>
        </View>
        <Pressable
          onPress={() => {
            set({ urgent: true });
            setSheet(null);
            toast({ text: 'Urgent hiring paid · $2.99', kind: 'paid', icon: 'fire' });
          }}
          accessibilityRole="button"
          style={{ height: 56, borderRadius: 18, backgroundColor: c.inverse, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="bodyL" weight={700} color="onInverse" style={{ fontSize: 16 }}>
            Pay with Apple Pay
          </Text>
        </Pressable>
        <Pressable onPress={() => setSheet(null)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6 }}>
          <Text variant="body" weight={700} color="textBody">
            Not now
          </Text>
        </Pressable>
        <Text variant="caption" weight={400} color="textLightSecondary" align="center" style={{ fontSize: 11 }}>
          Charged to your Apple ID. Not a subscription — it won’t renew.
        </Text>
      </BottomSheet>
    </FormScreen>
  );
}
