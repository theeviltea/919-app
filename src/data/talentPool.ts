import type { ImageSourcePropType } from 'react-native';

import { personPhoto as p } from './mock';

// Candidate pool for employer search and filters (TalentSearch / TalentFilters). Deterministic mock, replaced by the API.

export type TalentSphere = 'hospitality' | 'fnb' | 'events' | 'modeling' | 'music' | 'beauty' | 'service';
export const talentSphereLabels: Record<TalentSphere, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  events: 'Events',
  modeling: 'Modeling',
  music: 'Music',
  beauty: 'Beauty',
  service: 'Service',
};
export const talentSphereOrder: TalentSphere[] = ['hospitality', 'fnb', 'events', 'modeling', 'music', 'beauty', 'service'];

export type Gender = 'female' | 'male';
export type ProfileHas = 'video' | 'photos' | 'links';

export type Candidate = {
  id: string;
  name: string; // "Ibrahim K."
  role: string;
  city: string;
  country: string;
  sphere: TalentSphere;
  gender: Gender;
  age: number;
  languages: string[];
  premium: boolean;
  verified: boolean;
  photo: ImageSourcePropType;
  placeholder: 1 | 2 | 3 | 4 | 5;
  tint: string;
  video?: { duration: string; views: string };
  photos: boolean;
  links: boolean;
};

const female = [0, 1, 2, 3, 4, 5, 6, 8, 12, 13, 14];
const male = [9, 10];
const tints = ['#2A2235', '#1B2A44', '#2C2140', '#13302A', '#3A2418', '#1A1F2B'];

// [name, role, sphere, gender, city]
const seed: [string, string, TalentSphere, Gender, string][] = [
  ['Ibrahim K.', 'Bartender', 'hospitality', 'male', 'Dubai'],
  ['Akmed V.', 'Bartender', 'hospitality', 'male', 'Dubai'],
  ['Lucas M.', 'Head bartender', 'hospitality', 'male', 'Dubai'],
  ['Rita S.', 'Bartender, mixology', 'hospitality', 'female', 'Dubai'],
  ['Angela R.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Nour A.', 'Bartender', 'hospitality', 'female', 'Dubai'],
  ['Sofia L.', 'Hostess, events', 'events', 'female', 'Dubai'],
  ['Layla H.', 'Waitress', 'hospitality', 'female', 'Dubai'],
  ['Mira K.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Sveta V.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Elena S.', 'Promo model', 'modeling', 'female', 'Dubai'],
  ['Kira L.', 'Promo model', 'modeling', 'female', 'Dubai'],
  ['Nadia O.', 'Model', 'modeling', 'female', 'Dubai'],
  ['Wakako T.', 'Promo, hostess', 'events', 'female', 'Dubai'],
  ['Omar H.', 'Event host', 'events', 'male', 'Abu Dhabi'],
  ['Daria P.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Anna B.', 'Barista', 'fnb', 'female', 'Dubai'],
  ['Zaurbek T.', 'Driver', 'service', 'male', 'Dubai'],
  ['Omar R.', 'Valet', 'service', 'male', 'Dubai'],
  ['Masha D.', 'Model', 'modeling', 'female', 'Dubai'],
  ['Boris A.', 'DJ', 'music', 'male', 'Dubai'],
  ['Zoey M.', 'Singer', 'music', 'female', 'Dubai'],
  ['Chen W.', 'Image model', 'modeling', 'female', 'Dubai'],
  ['Tara N.', 'Model', 'modeling', 'female', 'Abu Dhabi'],
  ['Mia D.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Yasmin F.', 'Make-up artist', 'beauty', 'female', 'Dubai'],
  ['Lina M.', 'Stylist', 'beauty', 'female', 'Dubai'],
  ['Hana S.', 'Waitress', 'fnb', 'female', 'Abu Dhabi'],
  ['Karim B.', 'Waiter', 'fnb', 'male', 'Dubai'],
  ['Alina G.', 'Champagne girl', 'hospitality', 'female', 'Dubai'],
  ['Victoria P.', 'Dancer', 'events', 'female', 'Dubai'],
  ['Sami J.', 'Sommelier', 'fnb', 'male', 'Dubai'],
  ['Reem A.', 'Hostess', 'hospitality', 'female', 'Sharjah'],
  ['Inna K.', 'Photographer', 'service', 'female', 'Dubai'],
  ['Adam T.', 'Bartender', 'hospitality', 'male', 'Abu Dhabi'],
  ['Polina R.', 'Promo model', 'modeling', 'female', 'Abu Dhabi'],
  ['Farah N.', 'Barista', 'fnb', 'female', 'Dubai'],
  ['Leo V.', 'Musician', 'music', 'male', 'Dubai'],
  ['Kate O.', 'Animator', 'events', 'female', 'Dubai'],
  ['Dana E.', 'Nail artist', 'beauty', 'female', 'Sharjah'],
  ['Maya C.', 'Waitress', 'hospitality', 'female', 'Dubai'],
  ['Rania H.', 'Hostess', 'hospitality', 'female', 'Abu Dhabi'],
  ['Igor S.', 'Barback', 'hospitality', 'male', 'Dubai'],
  ['Eva L.', 'Model', 'modeling', 'female', 'Dubai'],
  ['Noor K.', 'Event coordinator', 'events', 'female', 'Dubai'],
  ['Tom B.', 'Waiter', 'fnb', 'male', 'Dubai'],
  ['Selin Y.', 'Vocalist', 'music', 'female', 'Dubai'],
  ['Amira Z.', 'Bartender', 'hospitality', 'female', 'Dubai'],
  ['Olga M.', 'Hairdresser', 'beauty', 'female', 'Dubai'],
  ['Hassan Q.', 'Security', 'service', 'male', 'Dubai'],
  ['Julia F.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Nina T.', 'Promo model', 'modeling', 'female', 'Dubai'],
  ['Sara Y.', 'Waitress', 'fnb', 'female', 'Dubai'],
  ['Marco D.', 'Chef de rang', 'fnb', 'male', 'Dubai'],
  ['Aya I.', 'Hostess', 'hospitality', 'female', 'Dubai'],
  ['Vera S.', 'Dancer', 'events', 'female', 'Abu Dhabi'],
  ['Ali M.', 'DJ', 'music', 'male', 'Abu Dhabi'],
  ['Ksenia P.', 'Model', 'modeling', 'female', 'Dubai'],
  ['Laura G.', 'Bartender', 'hospitality', 'female', 'Dubai'],
  ['Dina R.', 'Barista', 'fnb', 'female', 'Dubai'],
];

const langSets = [['English'], ['English', 'Arabic'], ['English', 'Russian'], ['English', 'French'], ['English', 'Arabic', 'French'], ['Arabic'], ['English', 'Spanish']];
const durations = ['0:48', '0:36', '1:02', '0:29', '0:42', '0:51', '0:35', '0:28', '1:04', '0:38'];

export const candidates: Candidate[] = seed.map(([name, role, sphere, gender, city], i) => {
  const pool = gender === 'male' ? male : female;
  return {
    id: `c${i + 1}`,
    name,
    role,
    city,
    country: 'United Arab Emirates',
    sphere,
    gender,
    age: 20 + ((i * 7) % 15),
    languages: langSets[i % langSets.length],
    premium: i % 4 === 0,
    verified: i % 5 !== 3,
    photo: p(pool[i % pool.length]),
    placeholder: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    tint: tints[i % tints.length],
    video: i % 3 !== 2 ? { duration: durations[i % durations.length], views: `${(((i * 37) % 120) / 10 + 1).toFixed(1)}k` } : undefined,
    photos: true,
    links: i % 4 !== 1,
  };
});

export type TalentFilters = {
  spheres: TalentSphere[];
  country?: string;
  city?: string;
  gender: 'any' | Gender;
  ageFrom?: string;
  ageTo?: string;
  languages: string[];
  has: ProfileHas[];
};
export const emptyTalentFilters: TalentFilters = { spheres: [], gender: 'any', languages: [], has: [] };

export const hasLabels: Record<ProfileHas, string> = { video: 'Video presentation', photos: 'Photos', links: 'Portfolio links' };

export function applyTalentFilters(list: Candidate[], f: TalentFilters) {
  const from = f.ageFrom ? Number(f.ageFrom) : 0;
  const to = f.ageTo ? Number(f.ageTo) : 200;
  return list.filter(
    (c) =>
      (!f.spheres.length || f.spheres.includes(c.sphere)) &&
      (!f.country || c.country === f.country) &&
      (!f.city || c.city === f.city) &&
      (f.gender === 'any' || c.gender === f.gender) &&
      c.age >= from &&
      c.age <= to &&
      f.languages.every((l) => c.languages.includes(l)) &&
      (!f.has.includes('video') || !!c.video) &&
      (!f.has.includes('photos') || c.photos) &&
      (!f.has.includes('links') || c.links),
  );
}

/** Active filters as removable chips (TalentFilterResults): city replaces country when both are set. */
export function talentChips(f: TalentFilters): { key: string; label: string; remove: (f: TalentFilters) => TalentFilters }[] {
  const out: { key: string; label: string; remove: (f: TalentFilters) => TalentFilters }[] = [];
  f.spheres.forEach((s) => out.push({ key: `s-${s}`, label: talentSphereLabels[s], remove: (x) => ({ ...x, spheres: x.spheres.filter((y) => y !== s) }) }));
  if (f.city) out.push({ key: 'city', label: f.city, remove: (x) => ({ ...x, city: undefined }) });
  else if (f.country) out.push({ key: 'country', label: f.country, remove: (x) => ({ ...x, country: undefined }) });
  if (f.gender !== 'any') out.push({ key: 'g', label: f.gender === 'female' ? 'Female' : 'Male', remove: (x) => ({ ...x, gender: 'any' }) });
  if (f.ageFrom || f.ageTo) out.push({ key: 'age', label: f.ageFrom && f.ageTo ? `${f.ageFrom}–${f.ageTo}` : f.ageFrom ? `${f.ageFrom}+` : `Up to ${f.ageTo}`, remove: (x) => ({ ...x, ageFrom: undefined, ageTo: undefined }) });
  f.languages.forEach((l) => out.push({ key: `l-${l}`, label: l, remove: (x) => ({ ...x, languages: x.languages.filter((y) => y !== l) }) }));
  f.has.forEach((h) => out.push({ key: `h-${h}`, label: h === 'video' ? 'Video' : hasLabels[h], remove: (x) => ({ ...x, has: x.has.filter((y) => y !== h) }) }));
  return out;
}
export const countTalentFilters = (f: TalentFilters) => talentChips(f).length;

/** Word-stem match on name and role: "bartenders" finds "Bartender", "host" finds "Hostess". */
export function matchesCandidate(c: Candidate, q: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${c.name} ${c.role} ${talentSphereLabels[c.sphere]}`.toLowerCase();
  return words.every((w) => hay.includes(w.length > 4 ? w.slice(0, -1) : w));
}
