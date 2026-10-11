import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Field, Icon, IconButton, Pressable, Text } from '@/components';
import { contractTypes, spheres, vacancySpheres } from '@/data/dictionaries';
import { allCountries, citiesFor, countryCode, countryShort, popularCountryNames } from '@/data/registration';
import type { ContractType, Sphere } from '@/data/types';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

import { RangeSlider } from './RangeSlider';

export type VacancyFilters = { urgent: boolean; spheres: Sphere[]; contracts: ContractType[]; country?: string; city?: string; min?: string; max?: string };
export const emptyFilters: VacancyFilters = { urgent: false, spheres: [], contracts: [] };
export const countFilters = (f: VacancyFilters) => (f.urgent ? 1 : 0) + f.spheres.length + f.contracts.length + (f.country ? 1 : 0) + (f.city ? 1 : 0) + (f.min || f.max ? 1 : 0);

type Filterable = { urgent: boolean; sphere: Sphere; city: string; country: string; pay: { amount: number; contract: ContractType } };

export function applyFilters<V extends Filterable>(list: V[], f: VacancyFilters) {
  return list.filter(
    (v) =>
      (!f.urgent || v.urgent) &&
      (!f.spheres.length || f.spheres.includes(v.sphere)) &&
      (!f.country || v.country === f.country) &&
      (!f.city || v.city === f.city) &&
      (!f.contracts.length || f.contracts.includes(v.pay.contract)) &&
      (!f.min || v.pay.amount >= Number(f.min)) &&
      (!f.max || v.pay.amount <= Number(f.max)),
  );
}

const toggle = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);
const SLIDER_MAX = 2000;
const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');

type Props<V extends Filterable> = { visible: boolean; value: VacancyFilters; source: V[]; onClose: () => void; onApply: (f: VacancyFilters) => void };

/** Vacancy filters (product rules §8): All / Urgent, Sphere, Location, Pay (contract type + from–to). Full-screen, as in SeekFilters. */
export function FiltersSheet<V extends Filterable>(props: Props<V>) {
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

function Body<V extends Filterable>({ value, source, onClose, onApply }: Props<V>) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [f, setF] = useState(value);
  const [sheet, setSheet] = useState<'country' | 'city' | null>(null);
  const set = (u: Partial<VacancyFilters>) => setF((x) => ({ ...x, ...u }));
  const n = applyFilters(source, f).length;
  const all = applyFilters(source, { ...f, urgent: false }).length;
  const urgent = applyFilters(source, { ...f, urgent: true }).length;
  const cities = citiesFor(f.country);
  const countIn = (k: Partial<VacancyFilters>) => applyFilters(source, { ...f, country: undefined, city: undefined, ...k }).length;
  const low = Number(f.min || 0);
  const high = f.max ? Number(f.max) : SLIDER_MAX;

  const tab = (key: 'all' | 'urgent', label: string, count: number) => {
    const on = f.urgent === (key === 'urgent');
    return (
      <Pressable
        onPress={() => set({ urgent: key === 'urgent' })}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        style={{ flex: 1, height: 40, borderRadius: 12, backgroundColor: on ? c.surface : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: on ? '0 2px 8px rgba(14,26,43,0.08)' : undefined }}>
        {key === 'urgent' ? (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="fire" size={12} color="onUrgent" />
          </View>
        ) : null}
        <Text variant="body" weight={on ? 700 : 600} color={on ? 'textHeadline' : 'textPrimary'} style={{ fontSize: 15 }}>
          {label}{' '}
          <Text variant="body" weight={600} color="textBody" style={{ fontSize: 15 }}>
            {count}
          </Text>
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconButton icon="cancel" label="Close filters" onPress={onClose} />
          <Text variant="displayL" accessibilityRole="header" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>
            Filters
          </Text>
          <Pressable onPress={() => setF(emptyFilters)} accessibilityRole="button" hitSlop={10}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Reset
            </Text>
          </Pressable>
        </View>

        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, backgroundColor: c.backDarker }}>
          {tab('all', 'All vacancies', all)}
          {tab('urgent', 'Urgent', urgent)}
        </View>

        {f.urgent ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, backgroundColor: c.surface }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="fire" size={16} color="onUrgent" />
            </View>
            <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
              Employers want to hire within 24 hours. Respond fast — urgent vacancies close quickly.
            </Text>
          </View>
        ) : null}

        <Card title="Sphere" hint="Any, if none selected">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {vacancySpheres.map((s) => (
              <Chip key={s} label={spheres[s]} check selected={f.spheres.includes(s)} onPress={() => set({ spheres: toggle(f.spheres, s) })} />
            ))}
          </View>
        </Card>

        <Card title="Location">
          <View style={{ gap: 8 }}>
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
          </View>
        </Card>

        <Card title="Pay" hint="Contract type and amount">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(contractTypes) as ContractType[]).map((k) => (
              <Chip key={k} label={contractTypes[k].label} check selected={f.contracts.includes(k)} onPress={() => set({ contracts: toggle(f.contracts, k) })} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field onSurface label="From, AED" value={f.min ?? ''} onChangeText={(v) => set({ min: v.replace(/\D/g, '') || undefined })} placeholder="0" keyboardType="number-pad" inputMode="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Field onSurface label="To, AED" value={f.max ?? ''} onChangeText={(v) => set({ max: v.replace(/\D/g, '') || undefined })} placeholder="Any" keyboardType="number-pad" inputMode="numeric" />
            </View>
          </View>
          <RangeSlider
            min={0}
            max={SLIDER_MAX}
            step={50}
            low={Math.min(low, SLIDER_MAX - 50)}
            high={Math.min(high, SLIDER_MAX)}
            format={(v, isMax) => (isMax && v >= SLIDER_MAX ? `${fmt(SLIDER_MAX)}+` : fmt(v))}
            onChange={(lo, hi) => set({ min: lo ? String(lo) : undefined, max: hi >= SLIDER_MAX ? undefined : String(hi) })}
          />
        </Card>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 14) + 6, backgroundColor: c.surfacePanel, borderTopWidth: 1, borderColor: c.divider, backdropFilter: 'blur(12px)' } as object}>
        <View style={{ width: '100%', maxWidth: 568, alignSelf: 'center' }}>
          <Button size="l" label={n ? `Show ${n} vacanc${n === 1 ? 'y' : 'ies'}` : 'Nothing found'} disabled={!n} onPress={() => onApply(f)} />
        </View>
      </View>

      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[
          { items: ['Any country'] },
          { title: 'POPULAR', items: popularCountryNames },
          { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) },
        ]}
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
    </View>
  );
}
