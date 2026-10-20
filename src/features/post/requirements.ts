import { appearanceTypes, clothingSizes, fieldByKey, genres, hairColors, type Field as FieldKey } from '@/data/registration';
import type { VacancyDetail } from '@/data/hiring';

import { currencyCode, type LangReq, type ParamValue, type VacancyDraft } from './draft';

// Requirement parameters per field and how a draft becomes the published vacancy (new and edited).

export type Kind = 'number' | 'chips' | 'bool' | 'langs';
export type ParamDef = { key: string; label: string; unit?: string; kind: Kind; options?: string[] };

export const LANGS = ['English', 'Arabic', 'Russian', 'French', 'Spanish', 'German', 'Italian', 'Hindi', 'Chinese', 'Turkish'];
export const LEVELS = ['Native', 'Fluent', 'Conversational', 'Basic'];
export const AGES = ['Any', '18–20', '21–24', '25–29', '30–35', '36+'];
export const SEXES = ['Any', 'Female', 'Male'];

const body: ParamDef[] = [
  { key: 'height', label: 'Height', unit: 'cm', kind: 'number' },
  { key: 'weight', label: 'Weight', unit: 'kg', kind: 'number' },
  { key: 'bust', label: 'Bust', unit: 'cm', kind: 'number' },
  { key: 'waist', label: 'Waist', unit: 'cm', kind: 'number' },
  { key: 'hips', label: 'Hips', unit: 'cm', kind: 'number' },
  { key: 'clothing', label: 'Clothing size', kind: 'chips', options: clothingSizes },
  { key: 'shoe', label: 'Shoe size', unit: 'EU', kind: 'number' },
  { key: 'hair', label: 'Hair color', kind: 'chips', options: ['Blonde', ...hairColors.filter((h) => h !== 'Blonde'), 'Black'] },
  { key: 'appearance', label: 'Appearance type', kind: 'chips', options: [...appearanceTypes, 'Middle Eastern'] },
  { key: 'tattoos', label: 'Tattoos / piercings', kind: 'chips', options: ['No visible tattoos', 'Tattoos allowed', 'No piercings'] },
];
const common: ParamDef[] = [
  { key: 'languages', label: 'Languages', kind: 'langs' },
  { key: 'video', label: 'Video presentation', kind: 'bool' },
];
/** Additional parameters depend on the field (the same set the seeker questionnaires collect). */
export const paramsFor = (f?: FieldKey): ParamDef[] => {
  if (f === 'music') return [{ key: 'genre', label: 'Genre', kind: 'chips', options: genres }, { key: 'equipment', label: 'Own equipment', kind: 'bool' }, ...common];
  if (f === 'service') return [{ key: 'portfolio', label: 'Portfolio links', kind: 'bool' }, { key: 'equipment', label: 'Own equipment', kind: 'bool' }, ...common];
  return [...body, ...(f === 'model' ? [{ key: 'catwalk', label: 'Catwalk experience', kind: 'bool' as const }] : []), ...common];
};

/** Ticked requirements as the chips candidates see: "English — fluent", "Height 170 cm", "Video presentation". */
export function requirementChips(defs: ParamDef[], params: Record<string, ParamValue>, langs: LangReq[], age?: string) {
  const out = langs.map((l) => `${l.name} — ${l.level.toLowerCase()}`);
  if (age && age !== 'Any') out.push(`Age ${age}`);
  for (const p of defs) {
    const v = params[p.key];
    if (v === undefined || p.kind === 'langs') continue;
    if (p.kind === 'bool') out.push(p.label);
    else if (Array.isArray(v)) v.forEach((x) => out.push(x));
    else if (v) out.push(`${p.label} ${v}${p.unit ? ` ${p.unit}` : ''}`);
  }
  return out;
}

/** The published vacancy details for a draft (VacSent and Edit vacancy). */
export function detailFromDraft(d: VacancyDraft, posted: string): VacancyDetail {
  return {
    category: d.field ? fieldByKey(d.field).label : 'Vacancy',
    contract: d.contract,
    currency: currencyCode(d.currency),
    amount: d.amountMode === 'negotiable' ? undefined : Number(d.amount.replace(/\D/g, '')) || 0,
    from: d.amountMode === 'from',
    role: d.roles.join(', ') || d.title.trim(),
    gender: d.sex || 'Any',
    age: d.age ?? 'Any',
    city: d.city,
    country: d.country,
    description: d.description.trim(),
    requirements: requirementChips(paramsFor(d.field), d.params, d.languages, d.age),
    photos: [d.cover!, ...d.photos],
    posted,
    views: 0,
    form: { field: d.field, roles: d.roles, startDate: d.startDate, params: d.params, languages: d.languages, amountMode: d.amountMode, currency: d.currency },
  };
}
