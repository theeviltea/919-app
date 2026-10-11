import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomSheet, Button, Chip, Field, SegmentedTabs, Text } from '@/components';
import { contractTypes, spheres, vacancySpheres } from '@/data/dictionaries';
import type { ContractType, Sphere } from '@/data/types';

export type VacancyFilters = { urgent: boolean; spheres: Sphere[]; contracts: ContractType[]; city?: string; min?: string; max?: string };
export const emptyFilters: VacancyFilters = { urgent: false, spheres: [], contracts: [] };
export const countFilters = (f: VacancyFilters) => (f.urgent ? 1 : 0) + f.spheres.length + f.contracts.length + (f.min || f.max ? 1 : 0);

const toggle = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

/** Vacancy filters (product rules §8): All / Urgent, Sphere, Pay (contract type + from–to). No dates, districts or toggles. */
export function FiltersSheet({ visible, value, onClose, onApply, resultCount }: { visible: boolean; value: VacancyFilters; onClose: () => void; onApply: (f: VacancyFilters) => void; resultCount: (f: VacancyFilters) => number }) {
  const [f, setF] = useState(value);
  const n = resultCount(f);
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters" closable>
      <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: 16 }}>
        <SegmentedTabs
          items={[
            { key: 'all', label: 'All vacancies' },
            { key: 'urgent', label: 'Urgent' },
          ]}
          value={f.urgent ? 'urgent' : 'all'}
          onChange={(k) => setF({ ...f, urgent: k === 'urgent' })}
        />
        <View style={{ gap: 10 }}>
          <Text variant="bodyL" weight={700}>
            Sphere
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {vacancySpheres.map((s) => (
              <Chip key={s} label={spheres[s]} check selected={f.spheres.includes(s)} onPress={() => setF({ ...f, spheres: toggle(f.spheres, s) })} />
            ))}
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="bodyL" weight={700}>
            Pay
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(contractTypes) as ContractType[]).map((k) => (
              <Chip key={k} label={contractTypes[k].label} check selected={f.contracts.includes(k)} onPress={() => setF({ ...f, contracts: toggle(f.contracts, k) })} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field onSurface label="From, AED" value={f.min ?? ''} onChangeText={(v) => setF({ ...f, min: v.replace(/\D/g, '') })} placeholder="0" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field onSurface label="To, AED" value={f.max ?? ''} onChangeText={(v) => setF({ ...f, max: v.replace(/\D/g, '') })} placeholder="Any" keyboardType="number-pad" />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button variant="neutral" label="Reset" onPress={() => setF(emptyFilters)} style={{ flex: 1 }} />
        <Button label={n ? `Show ${n} vacancies` : 'Nothing found'} disabled={!n} onPress={() => onApply(f)} style={{ flex: 2 }} />
      </View>
    </BottomSheet>
  );
}

export function applyFilters<V extends { urgent: boolean; sphere: Sphere; pay: { amount: number; contract: ContractType } }>(list: V[], f: VacancyFilters) {
  return list.filter(
    (v) =>
      (!f.urgent || v.urgent) &&
      (!f.spheres.length || f.spheres.includes(v.sphere)) &&
      (!f.contracts.length || f.contracts.includes(v.pay.contract)) &&
      (!f.min || v.pay.amount >= Number(f.min)) &&
      (!f.max || v.pay.amount <= Number(f.max)),
  );
}
