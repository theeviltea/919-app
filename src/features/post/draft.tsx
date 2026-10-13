import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import type { Field } from '@/data/registration';
import { contractTypes } from '@/data/dictionaries';
import type { ContractType } from '@/data/types';

export type AmountMode = 'exact' | 'from' | 'negotiable';
export type ParamValue = string | boolean | string[];
export type LangReq = { name: string; level: string };

/** New vacancy draft, shared by the four steps (VacCategory → VacBasic → VacSalary → VacRequirements). */
export type VacancyDraft = {
  field?: Field;
  roles: string[];
  cover?: ImageSourcePropType;
  title: string;
  description: string;
  startDate?: string; // ISO yyyy-mm-dd
  country: string;
  city: string;
  photos: ImageSourcePropType[];
  contract: ContractType;
  amountMode: AmountMode;
  currency?: string;
  amount: string;
  sex: string;
  age?: string;
  /** Additional requirements: ticked parameters and their values. */
  params: Record<string, ParamValue>;
  languages: LangReq[];
  urgent: boolean;
};

export const emptyDraft = (): VacancyDraft => ({
  roles: [],
  title: '',
  description: '',
  country: 'United Arab Emirates',
  city: 'Dubai',
  photos: [],
  contract: 'one-time',
  amountMode: 'exact',
  amount: '',
  sex: 'Any',
  params: {},
  languages: [],
  urgent: false,
});

type Ctx = { d: VacancyDraft; set: (u: Partial<VacancyDraft>) => void; reset: () => void };
const DraftCtx = createContext<Ctx | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<VacancyDraft>(emptyDraft);
  const value = useMemo<Ctx>(() => ({ d, set: (u) => setD((x) => ({ ...x, ...u })), reset: () => setD(emptyDraft()) }), [d]);
  return <DraftCtx.Provider value={value}>{children}</DraftCtx.Provider>;
}

export function useDraft() {
  const v = useContext(DraftCtx);
  if (!v) throw new Error('useDraft must be used inside <DraftProvider>');
  return v;
}

export const CURRENCIES = ['AED · UAE dirham', 'USD · US dollar', 'EUR · Euro', 'SAR · Saudi riyal'];
export const currencyCode = (c?: string) => (c ?? 'AED').split(' ')[0];
export const fmtAmount = (v: string) => v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (iso?: string) => {
  if (!iso) return '';
  const [, m, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[m - 1]}`;
};
export const dotDate = (iso?: string) => (iso ? iso.split('-').reverse().join('.') : '');

/** What candidates see on the card: "AED 5 000 · one-time", "from AED 120 / hour", "Negotiable · daily". */
export function payPreview(d: { amountMode: AmountMode; currency?: string; amount: string; contract: ContractType }) {
  const t = contractTypes[d.contract];
  if (d.amountMode === 'negotiable') return `Negotiable · ${t.label.toLowerCase()}`;
  const sum = `${currencyCode(d.currency)} ${fmtAmount(d.amount)}`;
  const tail = t.suffix.startsWith('/') ? ` ${t.suffix}` : ` · ${t.suffix}`;
  return `${d.amountMode === 'from' ? 'from ' : ''}${sum}${tail}`;
}

/** The vacancy just sent for review — handed to the Sent screen (images aren't URL-serialisable). */
export type SentVacancy = { id: string; title: string; city: string; pay: string; start?: string; cover?: ImageSourcePropType };
export const lastSent: { current?: SentVacancy } = {};
