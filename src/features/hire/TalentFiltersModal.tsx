import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Field, Icon, IconButton, Pressable, Text } from '@/components';
import { allCountries, citiesFor, countryCode, countryShort, popularCountryNames } from '@/data/registration';
import { applyTalentFilters, emptyTalentFilters, hasLabels, talentSphereLabels, talentSphereOrder, type Candidate, type ProfileHas, type TalentFilters } from '@/data/talentPool';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

const LANGUAGES = ['English', 'Arabic', 'Russian', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Hindi', 'Urdu', 'Chinese', 'Turkish'];
const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

type Props = { visible: boolean; value: TalentFilters; source: Candidate[]; onClose: () => void; onApply: (f: TalentFilters) => void };

/** Talent filters, full screen (TalentFilters): sphere, location, gender and age, languages, what the profile has. */
export function TalentFiltersModal(props: Props) {
  return (
    <Modal visible={props.visible} animationType="slide" onRequestClose={props.onClose} statusBarTranslucent>
      <SafeAreaProvider>{props.visible ? <Body {...props} /> : null}</SafeAreaProvider>
    </Modal>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <Text variant="bodyL" weight={700} accessibilityRole="header">
          {title}
        </Text>
        {hint ? (
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13, marginBottom: -4 }}>
      {children}
    </Text>
  );
}

function Body({ value, source, onClose, onApply }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [f, setF] = useState(value);
  const [sheet, setSheet] = useState<'country' | 'city' | { lang: number } | null>(null);
  const set = (u: Partial<TalentFilters>) => setF((x) => ({ ...x, ...u }));
  const n = applyTalentFilters(source, f).length;
  const cities = citiesFor(f.country);
  const countIn = (k: Partial<TalentFilters>) => applyTalentFilters(source, { ...f, country: undefined, city: undefined, ...k }).length;
  const langIndex = typeof sheet === 'object' && sheet ? sheet.lang : -1;

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconButton icon="cancel" label="Close filters" onPress={onClose} />
          <Text variant="displayL" accessibilityRole="header" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>
            Filters
          </Text>
          <Pressable onPress={() => setF(emptyTalentFilters)} accessibilityRole="button" hitSlop={10}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Reset
            </Text>
          </Pressable>
        </View>

        <Card title="Sphere" hint="Any, if none selected">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {talentSphereOrder.map((s) => (
              <Chip key={s} label={talentSphereLabels[s]} check selected={f.spheres.includes(s)} onPress={() => set({ spheres: toggle(f.spheres, s) })} />
            ))}
          </View>
        </Card>

        <Card title="Location">
          <Field onSurface label="Country" value={f.country} placeholder="Any country" onPress={() => setSheet('country')} rightIcon="chevron-down" />
          <Field
            onSurface
            label="City"
            value={f.city}
            placeholder={f.country ? 'Any city' : 'Choose a country first'}
            disabled={!f.country}
            onPress={f.country ? () => setSheet('city') : undefined}
            rightIcon="chevron-down"
          />
        </Card>

        <Card title="Candidate">
          <Label>Gender</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(
              [
                ['any', 'Any'],
                ['female', 'Female'],
                ['male', 'Male'],
              ] as const
            ).map(([k, l]) => (
              <Chip key={k} label={l} check selected={f.gender === k} onPress={() => set({ gender: k })} />
            ))}
          </View>
          <Label>Age</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field
                onSurface
                label="From"
                value={f.ageFrom ?? ''}
                onChangeText={(v) => set({ ageFrom: v.replace(/\D/g, '').slice(0, 2) || undefined })}
                placeholder="18"
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                onSurface
                label="To"
                value={f.ageTo ?? ''}
                onChangeText={(v) => set({ ageTo: v.replace(/\D/g, '').slice(0, 2) || undefined })}
                placeholder="Any"
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>
          </View>
        </Card>

        <Card title="Languages" hint="Speaks all selected">
          {f.languages.map((l, i) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Field onSurface label="Language" value={l} onPress={() => setSheet({ lang: i })} rightIcon="chevron-down" />
              </View>
              <Pressable
                onPress={() => set({ languages: f.languages.filter((x) => x !== l) })}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${l}`}
                style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={20} color="dangerText" />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => setSheet({ lang: f.languages.length })}
            accessibilityRole="button"
            style={{ height: 48, borderRadius: 16, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="add" size={20} color="textHeadline" />
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Add language
            </Text>
          </Pressable>
        </Card>

        <Card title="Profile has">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['video', 'photos', 'links'] as ProfileHas[]).map((h) => (
              <Chip key={h} label={hasLabels[h]} check selected={f.has.includes(h)} onPress={() => set({ has: toggle(f.has, h) })} />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View
        style={
          {
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 14) + 6,
            backgroundColor: c.surfacePanel,
            borderTopWidth: 1,
            borderColor: c.divider,
            backdropFilter: 'blur(12px)',
          } as object
        }>
        <View style={{ width: '100%', maxWidth: 568, alignSelf: 'center' }}>
          <Button size="l" label={n ? `Show ${n} profile${n === 1 ? '' : 's'}` : 'Nothing found'} disabled={!n} onPress={() => onApply(f)} />
        </View>
      </View>

      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[{ items: ['Any country'] }, { title: 'POPULAR', items: popularCountryNames }, { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) }]}
        badge={(x) => (x === 'Any country' ? undefined : (countryCode[x] ?? x.slice(0, 2).toUpperCase()))}
        meta={(x) => String(x === 'Any country' ? countIn({}) : countIn({ country: x }))}
        value={f.country ?? 'Any country'}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          set({ country: v === 'Any country' ? undefined : v, city: v === f.country ? f.city : undefined });
          setSheet(null);
        }}
      />
      <SelectSheet
        visible={sheet === 'city'}
        title="City"
        searchPlaceholder={`Search city in ${f.country ? (countryShort[f.country] ?? f.country) : ''}`}
        sections={[{ items: ['Any city'] }, { title: f.country?.toUpperCase(), items: cities }]}
        meta={(x) => String(x === 'Any city' ? countIn({ country: f.country }) : countIn({ country: f.country, city: x }))}
        value={f.city ?? 'Any city'}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          set({ city: v === 'Any city' ? undefined : v });
          setSheet(null);
        }}
      />
      <SelectSheet
        visible={langIndex >= 0}
        title="Language"
        searchPlaceholder="Search language"
        options={LANGUAGES.filter((l) => l === f.languages[langIndex] || !f.languages.includes(l))}
        value={f.languages[langIndex] ?? ''}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          const next = [...f.languages];
          next[langIndex] = v;
          set({ languages: next });
          setSheet(null);
        }}
      />
    </View>
  );
}
