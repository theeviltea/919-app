import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { ageFrom, type Field } from './registration';
import { useSession } from './session';
import { useSignup, type FieldEntry, type Photo, type SeekerDraft } from './signup';
import type { Sphere, Vacancy } from './types';

// ---------- profile

export type LangLevel = 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
export type Language = { code: string; name: string; level: LangLevel };
/** Month precision; `d` only when the person picked an exact day. Months are 0-based. */
export type YM = { y: number; m: number; d?: number };
export type Job = { id: string; role: string; company: string; city: string; category: string; start: YM; end?: YM; current: boolean; description: string };
export type Study = { id: string; institution: string; degree: string; field: string; start: number; end?: number; current: boolean };
export type LinkKind = 'web' | 'soundcloud' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'spotify' | 'linkedin';
export type ProfileLink = { id: string; kind: LinkKind; value: string };

export const linkKinds: Record<LinkKind, { label: string; code: string; placeholder: string }> = {
  web: { label: 'Portfolio', code: 'WEB', placeholder: 'yoursite.com' },
  soundcloud: { label: 'SoundCloud', code: 'SC', placeholder: 'soundcloud.com/you' },
  instagram: { label: 'Instagram', code: 'IG', placeholder: '@username' },
  facebook: { label: 'Facebook', code: 'FB', placeholder: 'Profile link' },
  tiktok: { label: 'TikTok', code: 'TT', placeholder: '@username' },
  youtube: { label: 'YouTube', code: 'YT', placeholder: 'youtube.com/@you' },
  spotify: { label: 'Spotify', code: 'SP', placeholder: 'Artist link' },
  linkedin: { label: 'LinkedIn', code: 'IN', placeholder: 'linkedin.com/in/you' },
};

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = MONTHS.map((m) => m.slice(0, 3));
export const fmtYM = (v?: YM, short = false) => (v ? `${v.d && !short ? `${v.d} ` : ''}${short ? MON[v.m] : MONTHS[v.m]} ${v.y}` : '');
const months = (a: YM, b: YM) => Math.max(0, (b.y - a.y) * 12 + b.m - a.m + 1);
export const nowYM = (): YM => ({ y: new Date().getFullYear(), m: new Date().getMonth() });
export function fmtLength(n: number) {
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo${m > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ') || '1 mo';
}
export const jobMonths = (j: Job) => months(j.start, j.current || !j.end ? nowYM() : j.end);
export const jobPeriod = (j: Job) => `${fmtYM(j.start, true)} — ${j.current || !j.end ? 'now' : fmtYM(j.end, true)} · ${fmtLength(jobMonths(j))}`;
export const totalExperience = (jobs: Job[]) => fmtLength(jobs.reduce((n, j) => n + jobMonths(j), 0));
export const studyPeriod = (e: Study) => `${e.start} — ${e.current || !e.end ? 'now' : e.end}`;

export type SeekerProfile = {
  firstName: string;
  lastName: string;
  verified: boolean;
  photo?: ImageSourcePropType;
  gender?: string;
  dob?: Date;
  age?: number;
  city?: string;
  country?: string;
  occupations: FieldEntry[];
  photos: Photo[];
  video?: { poster: ImageSourcePropType; duration: string; progress?: number };
  about: string;
  languages: Language[];
  experience: Job[];
  education: Study[];
  links: ProfileLink[];
  /** "+971 50 123 4567"; undefined when the account was created with email or a social login. */
  phone?: string;
  email?: string;
  emailSource?: 'google' | 'apple';
  stats: { views: number; applications: number; invites: number; videoViews: string };
};

const p = (n: number) => ({ id: `mp${n}`, source: [require('@/assets/images/mock/people/p2.jpg'), require('@/assets/images/mock/people/p3.jpg'), require('@/assets/images/mock/people/p4.jpg'), require('@/assets/images/mock/people/p5.jpg'), require('@/assets/images/mock/people/p6.jpg'), require('@/assets/images/mock/people/p7.jpg')][n] });

/** Existing account used when someone signs in instead of registering (prototype). */
const demoProfile: SeekerProfile = {
  firstName: 'Mia',
  lastName: 'Dakaskos',
  verified: true,
  photo: require('@/assets/images/mock/people/p1.jpg'),
  gender: 'Female',
  age: 25,
  city: 'Dubai',
  country: 'United Arab Emirates',
  occupations: [
    { field: 'hospitality', roles: ['Waiter'], details: { height: '165', weight: '45', clothing: 'XS', shoe: '36', hair: 'Brown', appearance: 'European' }, links: [] },
    { field: 'model', roles: ['Model', 'Image model'], details: { height: '165', weight: '45', bust: '86', waist: '61', hips: '90', clothing: 'XS', shoe: '36', hair: 'Brown', appearance: 'European' }, links: [] },
  ],
  photos: [0, 1, 2, 3, 4, 5].map(p),
  video: { poster: require('@/assets/images/mock/people/p12.jpg'), duration: '0:42' },
  about:
    'Five years in hospitality, from beach clubs in JBR to fine dining at DIFC. Calm under pressure, great with VIP guests. Also work as a commercial and runway model. Fluent in English and Russian, conversational Arabic. Available for evening and weekend shifts, can travel within the UAE.',
  languages: [
    { code: 'EN', name: 'English', level: 'Native' },
    { code: 'RU', name: 'Russian', level: 'Native' },
    { code: 'AR', name: 'Arabic', level: 'Basic' },
  ],
  experience: [
    {
      id: 'x1',
      role: 'Hostess',
      company: 'Atlantis The Palm',
      city: 'Dubai',
      category: 'Hospitality',
      start: { y: 2022, m: 2, d: 14 },
      current: true,
      description: 'Welcomed guests at the main restaurant, managed the waiting list and VIP seating for up to 300 covers a night.',
    },
    { id: 'x2', role: 'Waitress', company: 'Beach club, JBR', city: 'Dubai', category: 'F&B', start: { y: 2020, m: 5 }, end: { y: 2022, m: 1 }, current: false, description: '' },
  ],
  education: [{ id: 'e1', institution: 'Dubai Hospitality College', degree: 'Diploma', field: 'Hospitality management', start: 2017, end: 2019, current: false }],
  links: [
    { id: 'l1', kind: 'web', value: 'miadakaskos.com' },
    { id: 'l2', kind: 'soundcloud', value: 'soundcloud.com/mia.dj' },
    { id: 'l3', kind: 'instagram', value: '@mia.dakaskos' },
  ],
  phone: '+971 50 123 4567',
  email: 'mia.dakaskos@gmail.com',
  emailSource: 'google',
  stats: { views: 128, applications: 12, invites: 5, videoViews: '1.2k' },
};

/** Draft seeded on sign-in to the demo account, so registration screens can edit the same data. */
export const demoDraft: SeekerDraft = {
  demo: true,
  photo: demoProfile.photo,
  firstName: demoProfile.firstName,
  lastName: demoProfile.lastName,
  gender: 'Female',
  dob: new Date(new Date().getFullYear() - 25, 2, 14),
  country: 'United Arab Emirates',
  city: 'Dubai',
  occupations: demoProfile.occupations,
  photos: demoProfile.photos,
  video: demoProfile.video,
};

// ---------- applications

export type AppStatus = 'pending' | 'accepted' | 'declined' | 'hired' | 'closed';
export type Application = { vacancyId: string; status: AppStatus; note: string; chatId?: string; archived?: boolean; when?: string; message?: string };

const initialApps: Application[] = [
  { vacancyId: 'v3', status: 'accepted', note: 'Replied today', chatId: 'c-skyline' },
  { vacancyId: 'v1', status: 'pending', note: 'Applied 2 h ago · viewed' },
  { vacancyId: 'v2', status: 'pending', note: 'Applied yesterday' },
  { vacancyId: 'v4', status: 'declined', note: 'The position was filled', chatId: 'c-dives' },
  { vacancyId: 'v8', status: 'pending', note: 'Applied 3 d ago' },
  { vacancyId: 'v14', status: 'hired', note: 'Today · until 22:00', chatId: 'c-sara-promo', when: 'Today' },
  { vacancyId: 'v15', status: 'closed', note: 'Vacancy closed on 2 Oct', archived: true },
  { vacancyId: 'v16', status: 'hired', note: 'Job finished · 1 Jan', archived: true },
  { vacancyId: 'v17', status: 'declined', note: 'Archived on 18 Sep', archived: true },
];

// ---------- chats

export type Msg =
  | { id: string; kind: 'text'; mine: boolean; text: string; time: string; quote?: { author: string; text: string } }
  | { id: string; kind: 'photos'; mine: boolean; photos: ImageSourcePropType[]; text?: string; time: string }
  | { id: string; kind: 'video'; mine: boolean; poster: ImageSourcePropType; duration: string; text?: string; time: string }
  | { id: string; kind: 'contact'; mine: boolean; name: string; phone?: string; email?: string; photo?: ImageSourcePropType; time: string }
  | { id: string; kind: 'system'; tone: 'success' | 'danger'; text: string; time: string }
  | { id: string; kind: 'date'; label: string };

/** Message without its id (distributes over the union). */
export type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, 'id'> : never) : never;

export type Thread = {
  id: string;
  /** Vacancy context, or Direct (contact request from a Premium employer). */
  vacancyId?: string;
  company: { name: string; initials: string; verified: boolean };
  person: { name: string; role: string; online?: boolean; photo?: ImageSourcePropType };
  messages: Msg[];
  unread: number;
  time: string;
  state: 'active' | 'request' | 'withdrawn' | 'blocked' | 'declined';
  archived: boolean;
  requestText?: string;
};

const person = (n: number) => [require('@/assets/images/mock/people/p9.jpg'), require('@/assets/images/mock/people/p13.jpg'), require('@/assets/images/mock/people/p14.jpg'), require('@/assets/images/mock/people/p0.jpg')][n];

const initialThreads: Thread[] = [
  {
    id: 'c-request-azure',
    company: { name: 'Azure Beach Club', initials: 'AB', verified: true },
    person: { name: 'Nadia Saleh', role: 'HR', online: true, photo: person(1) },
    requestText: 'Hi Mia! We’re hiring hostesses for a new rooftop lounge, evening shifts. Would you like to talk?',
    messages: [{ id: 'd', kind: 'date', label: 'Today' }],
    unread: 1,
    time: '17:12',
    state: 'request',
    archived: false,
  },
  {
    id: 'c-orzu',
    vacancyId: 'v1',
    company: { name: 'ORZU Group', initials: 'OG', verified: true },
    person: { name: 'Karim', role: 'HR', online: true, photo: person(2) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Today' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi Mia! We liked your profile and the DJ mix on SoundCloud.', time: '14:20' },
      { id: 'm2', kind: 'text', mine: false, text: 'The party is on Friday, 20:00 – 02:00, Dubai Marina.', time: '14:21' },
      { id: 'm3', kind: 'text', mine: false, text: 'Schedule a call for tomorrow at 11:00?', time: '14:35' },
    ],
    unread: 3,
    time: '14:35',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-skyline',
    vacancyId: 'v3',
    company: { name: 'Skyline Hospitality', initials: 'SH', verified: true },
    person: { name: 'Lina Haddad', role: 'HR manager', photo: person(3) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Today' },
      { id: 's1', kind: 'system', tone: 'success', text: 'Your application was accepted', time: '08:40' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi Mia! Can you come for a short trial shift on Saturday at 18:00?', time: '09:05' },
      { id: 'm2', kind: 'text', mine: true, text: 'Ok, I’m waiting for the address', time: '09:12' },
    ],
    unread: 0,
    time: '09:12',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-dives',
    vacancyId: 'v4',
    company: { name: 'DIVES Holding', initials: 'DH', verified: true },
    person: { name: 'Omar Haddad', role: 'recruiter', online: true, photo: person(0) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Yesterday' },
      { id: 's1', kind: 'system', tone: 'success', text: 'Your application was accepted', time: '22:32' },
      { id: 'm1', kind: 'text', mine: false, text: 'Hi! Please send us your video presentation.', time: '22:32' },
      { id: 'm2', kind: 'text', mine: true, text: 'Hi! Great!', time: '22:29' },
      { id: 'm3', kind: 'text', mine: true, text: 'I’ll send the video in 2–3 hours', time: '22:29' },
      { id: 'd2', kind: 'date', label: 'Today' },
      { id: 'm4', kind: 'text', mine: false, text: 'We are waiting 😊', time: '01:32' },
      { id: 'm5', kind: 'text', mine: true, text: 'Sorry for the delay, I was out of network coverage', time: '02:29' },
      { id: 'm6', kind: 'video', mine: true, poster: require('@/assets/images/mock/people/p12.jpg'), duration: '0:42', text: 'Here is the video', time: '02:30' },
    ],
    unread: 0,
    time: 'Sat',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-sara',
    company: { name: 'Private recruiter', initials: 'SM', verified: false },
    person: { name: 'Sara Mendes', role: 'Private recruiter', photo: person(1) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Friday' },
      { id: 's1', kind: 'system', tone: 'success', text: 'You accepted the request', time: '12:01' },
      { id: 'm1', kind: 'text', mine: false, text: 'Have you worked at yacht events before?', time: '12:04' },
    ],
    unread: 1,
    time: 'Fri',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-sara-promo',
    vacancyId: 'v13',
    company: { name: 'Prestige Events', initials: 'PE', verified: true },
    person: { name: 'Sara Mendes', role: 'Private recruiter', photo: person(1) },
    messages: [
      { id: 'd1', kind: 'date', label: 'Monday' },
      { id: 'm1', kind: 'text', mine: false, text: 'Casting is on Monday, 10:00, Expo City', time: '10:02' },
    ],
    unread: 0,
    time: 'Mon',
    state: 'active',
    archived: false,
  },
  {
    id: 'c-old-1',
    vacancyId: 'v15',
    company: { name: 'Atlantis The Palm', initials: 'AP', verified: true },
    person: { name: 'Ravi Menon', role: 'F&B manager' },
    messages: [{ id: 'm1', kind: 'text', mine: false, text: 'Thank you for applying, the vacancy is closed.', time: '2 Oct' }],
    unread: 0,
    time: '2 Oct',
    state: 'active',
    archived: true,
  },
];

const guessKind = (l: string): LinkKind => {
  const k = (['soundcloud', 'instagram', 'facebook', 'tiktok', 'youtube', 'spotify', 'linkedin'] as LinkKind[]).find((x) => l.toLowerCase().includes(x));
  return k ?? 'web';
};
/** "+971|501234567" (session) → "+971 50 123 4567". */
const phoneLabel = (v: string) => {
  const [dial, d = ''] = v.includes('|') ? v.split('|') : ['+971', v.replace(/\D/g, '')];
  return `${dial} ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`.trim();
};

/** Profile strength for Edit profile and the "can't find you" banner. */
export function completeness(p: SeekerProfile) {
  const ready = p.photos.filter((x) => x.progress === undefined).length;
  const items = [
    { key: 'photo', done: !!p.photo, hint: 'Add a profile photo' },
    { key: 'photos', done: ready >= 3, hint: 'Add at least 3 photos', count: `${Math.min(ready, 3)} / 3` },
    { key: 'video', done: !!p.video, hint: 'Record a video presentation' },
    { key: 'about', done: !!p.about.trim(), hint: 'Write a few lines about you' },
    { key: 'languages', done: p.languages.length > 0, hint: 'Add your languages' },
    { key: 'experience', done: p.experience.length > 0, hint: 'Add your experience' },
    { key: 'education', done: p.education.length > 0, hint: 'Add your education' },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  /** Needed to appear in talent search. */
  const search = items.filter((i) => ['photos', 'video', 'about'].includes(i.key) && !i.done);
  const next = items.find((i) => !i.done);
  const nextPercent = Math.round(((items.filter((i) => i.done).length + 1) / items.length) * 100);
  return { percent, items, search, next, nextPercent };
}

// ---------- profile completeness (product rules §10)

export const sphereToField: Record<Sphere, Field> = { hospitality: 'hospitality', fnb: 'hospitality', events: 'entertainment', modeling: 'model', music: 'music', beauty: 'service' };

export type GateItem = { key: 'photo' | 'photos' | 'about' | 'field'; title: string; text: string };

export function missingForApply(p: SeekerProfile, v: Vacancy, fieldLabel: string): GateItem[] {
  const out: GateItem[] = [];
  if (!p.photo) out.push({ key: 'photo', title: 'Profile photo', text: 'A clear photo of your face' });
  const ready = p.photos.filter((x) => x.progress === undefined).length;
  if (ready < 3) out.push({ key: 'photos', title: 'Photos', text: `At least 3 photos · ${ready} added` });
  if (!p.about.trim()) out.push({ key: 'about', title: 'About you', text: 'A few lines about your experience' });
  if (!p.occupations.some((o) => o.field === sphereToField[v.sphere])) out.push({ key: 'field', title: `${fieldLabel} in your fields`, text: `This vacancy is in ${fieldLabel}` });
  return out;
}

/** Requirement check for "You fit N of M": known kinds are matched, the rest count as met. */
export function matchRequirement(req: string, p: SeekerProfile): boolean {
  const lang = req.match(/^(English|Arabic|Russian|French)/i);
  if (lang) return p.languages.some((l) => l.name.toLowerCase() === lang[1].toLowerCase());
  const age = req.match(/Age (\d+)\D+(\d+)/);
  if (age) return p.age !== undefined && p.age >= Number(age[1]) && p.age <= Number(age[2]);
  if (/video/i.test(req)) return !!p.video && p.video.progress === undefined;
  return true;
}

// ---------- store

type Store = {
  profile: SeekerProfile;
  updateProfile: (u: Partial<SeekerProfile>) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  /** Settings switches (notifications, privacy). */
  prefs: Record<string, boolean>;
  setPref: (k: string, v: boolean) => void;
  apps: Application[];
  appFor: (vacancyId: string) => Application | undefined;
  apply: (vacancyId: string, message: string) => void;
  withdraw: (vacancyId: string) => void;
  saved: string[];
  toggleSaved: (vacancyId: string) => boolean;
  threads: Thread[];
  thread: (id: string) => Thread | undefined;
  updateThread: (id: string, fn: (t: Thread) => Partial<Thread>) => void;
  send: (id: string, msg: NewMsg) => void;
  unreadTotal: number;
};

const Ctx = createContext<Store | null>(null);
let mid = 0;
const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Seeker-side data for the prototype: profile, applications, saved vacancies and chats. Replaced by the API later. */
export function SeekerProvider({ children }: { children: ReactNode }) {
  const { seeker: draft } = useSignup();
  const { user } = useSession();
  const [extra, setExtra] = useState<Partial<SeekerProfile>>({});
  const [hidden, setHidden] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    push: true, newVacancies: true, savedClosing: true, urgentNearby: false, appStatus: true, invites: true, messages: true, preview: true, digest: true, news: false, faceId: true, showAge: true, readReceipts: true,
  });
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [saved, setSaved] = useState<string[]>(['v13', 'v10', 'v11', 'v12']);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);

  const profile = useMemo<SeekerProfile>(() => {
    const base = draft.demo ? demoProfile : null;
    return {
      firstName: draft.firstName,
      lastName: draft.lastName,
      verified: !!base,
      photo: draft.photo,
      gender: draft.gender,
      dob: draft.dob,
      age: ageFrom(draft.dob),
      city: draft.city,
      country: draft.country,
      occupations: draft.occupations,
      photos: draft.photos,
      video: draft.video,
      about: base?.about ?? '',
      languages: base?.languages ?? [],
      experience: base?.experience ?? [],
      education: base?.education ?? [],
      links: base?.links ?? draft.occupations.flatMap((o) => o.links.map((l, i) => ({ id: `${o.field}${i}`, kind: guessKind(l), value: l.replace(/^https?:\/\//, '') }))),
      phone: base?.phone ?? (user?.phone ? phoneLabel(user.phone) : undefined),
      email: base?.email ?? user?.email,
      emailSource: base?.emailSource,
      stats: base?.stats ?? { views: 0, applications: 0, invites: 0, videoViews: '0' },
      ...extra,
    };
  }, [draft, extra, user]);

  const updateThread = useCallback((id: string, fn: (t: Thread) => Partial<Thread>) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, ...fn(t) } : t))), []);

  const value = useMemo<Store>(
    () => ({
      profile,
      updateProfile: (u) => setExtra((e) => ({ ...e, ...u })),
      hidden,
      setHidden,
      prefs,
      setPref: (k, v) => setPrefs((x) => ({ ...x, [k]: v })),
      apps,
      appFor: (id) => apps.find((a) => a.vacancyId === id),
      // The message goes with the application; the chat opens when the employer accepts.
      apply: (id, message) =>
        setApps((a) => [{ vacancyId: id, status: 'pending', note: 'Applied just now', message: message.trim() || undefined }, ...a.filter((x) => x.vacancyId !== id)]),
      withdraw: (id) => setApps((a) => a.map((x) => (x.vacancyId === id ? { ...x, status: 'closed', note: 'You withdrew the application', archived: true } : x))),
      saved,
      toggleSaved: (id) => {
        const on = !saved.includes(id);
        setSaved((s) => (on ? [id, ...s] : s.filter((x) => x !== id)));
        return on;
      },
      threads,
      thread: (id) => threads.find((t) => t.id === id),
      updateThread,
      send: (id, msg) =>
        setThreads((ts) =>
          ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, { ...msg, id: `n${++mid}` } as Msg], time: 'time' in msg ? (msg.time as string) : now(), unread: 0 } : t)),
        ),
      unreadTotal: threads.filter((t) => !t.archived).reduce((n, t) => n + t.unread, 0),
    }),
    [profile, hidden, prefs, apps, saved, threads, updateThread],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSeeker() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSeeker must be used inside <SeekerProvider>');
  return v;
}

export { now as clockNow };
