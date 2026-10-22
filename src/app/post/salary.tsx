import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Field, FormScreen, Icon, StepProgress, Text } from '@/components';
import { contractTypes } from '@/data/dictionaries';
import type { ContractType } from '@/data/types';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { CURRENCIES, fmtAmount, payPreview, useDraft, type AmountMode } from '@/features/post/draft';
import { Panel } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const HINTS: Record<ContractType, string> = {
  'one-time': 'A single job or event, paid once.',
  'fixed-term': 'A set period, e.g. a season or a 3-month project.',
  monthly: 'A regular job with a monthly salary.',
  weekly: 'Paid at the end of every week.',
  daily: 'Paid per day worked.',
  hourly: 'Paid per hour worked.',
};
const MODES: [AmountMode, string][] = [
  ['exact', 'Exact amount'],
  ['from', 'Amount from'],
  ['negotiable', 'Negotiable'],
];

/** New vacancy, step 3 of 4 — Salary (VacSalary / VacSalaryFilled). */
export default function VacancySalary() {
  const { c } = useTheme();
  const { d, set, editing } = useDraft();
  const [sheet, setSheet] = useState(false);
  const needsAmount = d.amountMode !== 'negotiable';
  const ok = !needsAmount || (!!d.currency && Number(d.amount.replace(/\D/g, '')) > 0);

  return (
    <FormScreen
      top={editing ? undefined : <StepProgress label="New vacancy" step={3} of={4} />}
      title="Salary"
      subtitle="Candidates filter vacancies by pay, so be specific."
      footer={<Button size="l" label={editing ? 'Done' : 'Proceed'} disabled={!ok} onPress={() => (editing ? router.back() : router.push('/post/requirements'))} />}>
      <Panel title="Contract type" gap={12}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(contractTypes) as ContractType[]).map((k) => (
            <Chip key={k} label={contractTypes[k].label} check selected={d.contract === k} onPress={() => set({ contract: k })} />
          ))}
        </View>
        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
          {HINTS[d.contract]}
        </Text>
      </Panel>

      <Panel title="Amount" gap={12}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MODES.map(([k, l]) => (
            <Chip key={k} label={l} check selected={d.amountMode === k} onPress={() => set({ amountMode: k })} />
          ))}
        </View>
        {needsAmount ? (
          <View style={{ gap: 8 }}>
            <Field onSurface label="Currency" required value={d.currency} placeholder="Select" onPress={() => setSheet(true)} rightIcon="chevron-down" />
            <Field
              onSurface
              label={d.amountMode === 'from' ? 'Amount from' : 'Amount'}
              required
              value={fmtAmount(d.amount)}
              onChangeText={(v) => set({ amount: v.replace(/\D/g, '').slice(0, 7) })}
              placeholder="Enter"
              keyboardType="number-pad"
              inputMode="numeric"
            />
          </View>
        ) : (
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13, lineHeight: 18 }}>
            Candidates see “Negotiable”. Vacancies with a clear amount get more applicants.
          </Text>
        )}
      </Panel>

      {ok && (d.amountMode === 'negotiable' || d.amount) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, backgroundColor: c.surface }}>
          <Icon name="wallet" size={18} color="textBody" />
          <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13 }}>
            Candidates will see{' '}
            <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
              {payPreview(d)}
            </Text>
          </Text>
        </View>
      ) : null}

      <SelectSheet visible={sheet} title="Currency" options={CURRENCIES} value={d.currency ?? ''} onClose={() => setSheet(false)} onSelect={(v) => (set({ currency: v }), setSheet(false))} />
    </FormScreen>
  );
}
