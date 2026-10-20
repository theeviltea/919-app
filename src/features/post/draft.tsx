import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { fieldByKey, fields, type Field } from '@/data/registration';
import type { VacancyDetail } from '@/data/hiring';
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

type Ctx = {
  d: VacancyDraft;
  set: (u: Partial<VacancyDraft>) => void;
  reset: () => void;
  /** Vacancy being edited (post/edit), or undefined for a new one. The steps then save back instead of moving on. */
  editing?: string;
  /** Snapshot taken when editing started: tells which sections changed. */
  original?: VacancyDraft;
  startEdit: (id: string, d: VacancyDraft) => void;
};
const DraftCtx = createContext<Ctx | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<VacancyDraft>(emptyDraft);
  const [edit, setEdit] = useState<{ id: string; original: VacancyDraft } | undefined>();
  const value = useMemo<Ctx>(
    () => ({
      d,
      set: (u) => setD((x) => ({ ...x, ...u })),
      reset: () => (setD(emptyDraft()), setEdit(undefined)),
      editing: edit?.id,
      original: edit?.original,
      startEdit: (id, draft) => (setD(draft), setEdit({ id, original: draft })),
    }),
    [d, edit],
  );
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

/** Rebuild the form from a published vacancy (Edit vacancy). Vacancies posted in the app carry their form; demo ones are parsed. */
export function draftFromVacancy(v: { title: string; cover: ImageSourcePropType; urgentLeft?: string; detail?: VacancyDetail }): VacancyDraft {
  const d = v.detail!;
  const f = d.form;
  const roleText = d.role.toLowerCase();
  // Whole-word match, longest role wins: "Hostess" is Hospitality, not Entertainment's "Host".
  const hit = (r: string) => new RegExp(`\\b${r.toLowerCase().replace(/[^a-z ]/g, '')}\\b`).test(roleText);
  const byRole = fields
    .flatMap((x) => x.roles.filter(hit).map((r) => ({ x, len: r.length })))
    .sort((a, b) => b.len - a.len)[0]?.x;
  const byLabel = fields.find((x) => x.label.toLowerCase() === d.category.toLowerCase()) ?? (d.category === 'Events' ? fields.find((x) => x.key === 'entertainment') : undefined);
  const field = (f?.field as Field | undefined) ?? byRole?.key ?? byLabel?.key;
  const roles = f?.roles ?? (field ? fieldByKey(field).roles.filter(hit) : []);
  const langs = f?.languages ?? d.requirements.filter((r) => r.includes(' — ')).map((r) => ({ name: r.split(' — ')[0], level: r.split(' — ')[1].replace(/^./, (x) => x.toUpperCase()) }));
  const params: Record<string, ParamValue> = f?.params ?? (d.requirements.includes('Video presentation') ? { video: true } : {});
  const start = new Date(Date.now() + 3 * 864e5);
  return {
    field,
    roles,
    cover: v.cover,
    title: v.title,
    description: d.description,
    startDate: f?.startDate ?? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
    country: d.country,
    city: d.city,
    photos: d.photos.filter((p) => p !== v.cover),
    contract: d.contract,
    amountMode: f?.amountMode ?? (d.amount == null ? 'negotiable' : d.from ? 'from' : 'exact'),
    currency: f?.currency ?? CURRENCIES.find((c) => c.startsWith(d.currency)) ?? CURRENCIES[0],
    amount: d.amount != null ? String(d.amount) : '',
    sex: d.gender || 'Any',
    age: d.age,
    params,
    languages: langs,
    urgent: !!v.urgentLeft,
  };
}
