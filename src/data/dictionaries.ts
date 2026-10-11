import type { Colors } from '@/theme';

import type { ContractType, Country, Sphere } from './types';

export const contractTypes: Record<ContractType, { label: string; suffix: string; tone: 'blue' | 'green' }> = {
  'one-time': { label: 'One-time', suffix: 'one-time', tone: 'blue' },
  'fixed-term': { label: 'Fixed term', suffix: 'fixed term', tone: 'blue' },
  monthly: { label: 'Monthly', suffix: '/ month', tone: 'green' },
  weekly: { label: 'Weekly', suffix: '/ week', tone: 'green' },
  daily: { label: 'Daily', suffix: '/ day', tone: 'green' },
  hourly: { label: 'Hourly', suffix: '/ hour', tone: 'green' },
};

/** Label colours: blue for one-off contracts, green for recurring. Orange is reserved for Premium. */
export const contractLabelColors: Record<'blue' | 'green', { back: keyof Colors; text: keyof Colors }> = {
  blue: { back: 'primarySecondary', text: 'link' },
  green: { back: 'successBack', text: 'successText' },
};

export const spheres: Record<Sphere, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  events: 'Events',
  modeling: 'Modeling',
  music: 'Music',
  beauty: 'Beauty',
};

export const vacancySpheres: Sphere[] = ['hospitality', 'fnb', 'events', 'modeling', 'music', 'beauty'];
export const talentSpheres: { key: Sphere; label: string }[] = [
  { key: 'hospitality', label: 'Hospitality' },
  { key: 'modeling', label: 'Models' },
  { key: 'events', label: 'Events' },
  { key: 'music', label: 'Music' },
  { key: 'beauty', label: 'Beauty' },
];

export const popularCountries: Country[] = [
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'KW', name: 'Kuwait', dial: '+965' },
  { code: 'BH', name: 'Bahrain', dial: '+973' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7' },
  { code: 'KG', name: 'Kyrgyzstan', dial: '+996' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
];

export const formatAmount = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
