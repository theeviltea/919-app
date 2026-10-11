import { router } from 'expo-router';
import { useState } from 'react';

import { useToast } from '@/components';
import { findVacancy } from '@/data/mock';
import { fieldByKey } from '@/data/registration';
import { completeness, missingForApply, sphereToField, useSeeker, type GateItem } from '@/data/seeker';

import { ApplyGate } from './ApplyGate';
import { ApplySheet } from './ApplySheet';

/**
 * Respond flow shared by the vacancy page and lists: incomplete profile → gate sheet (§10),
 * otherwise the apply sheet with an optional message. Render `sheets` once in the screen.
 */
export function useApply({ aboveTabBar }: { aboveTabBar?: boolean } = {}) {
  const toast = useToast();
  const seeker = useSeeker();
  const [state, setState] = useState<{ id: string; sheet: 'apply' | 'gate' } | null>(null);
  const v = state ? findVacancy(state.id) : undefined;
  const missing: GateItem[] = v ? missingForApply(seeker.profile, v, fieldByKey(sphereToField[v.sphere]).label) : [];

  const respond = (id: string) => {
    const vac = findVacancy(id);
    if (!vac) return;
    const gaps = missingForApply(seeker.profile, vac, fieldByKey(sphereToField[vac.sphere]).label);
    setState({ id, sheet: gaps.length ? 'gate' : 'apply' });
  };

  const fix = (k: GateItem['key']) => {
    setState(null);
    if (k === 'about' || k === 'photos') router.push('/profile/general');
    else if (k === 'photo') router.push('/profile/edit');
    else router.push('/profile/occupations');
  };

  const sheets = v ? (
    <>
      <ApplySheet
        key={v.id}
        v={v}
        visible={state?.sheet === 'apply'}
        onClose={() => setState(null)}
        onSend={(m) => {
          seeker.apply(v.id, m);
          setState(null);
          toast({ text: 'You’ve applied to this vacancy', icon: 'check', aboveTabBar });
        }}
      />
      <ApplyGate items={missing} percent={Math.max(10, Math.min(completeness(seeker.profile).percent, Math.round(((4 - missing.length) / 4) * 100)))} visible={state?.sheet === 'gate'} onClose={() => setState(null)} onFix={fix} />
    </>
  ) : null;

  return { respond, sheets };
}
