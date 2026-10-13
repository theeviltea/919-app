import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { mockImg as img, personPhoto as p } from './mock';

// Employer-side mock for the prototype (demo account: Emanuel Brooks, Skyline Hospitality). Mirrors the canvas
// screens TalentProfiles / TalentVideos / EmpHiring / EmpHiringSaved / EmpMessages* / Company*. Replaced by the API later.

export type Placeholder = 1 | 2 | 3 | 4 | 5;
export type TalentTile = { id: string; name: string; role: string; city: string; photo: ImageSourcePropType; premium?: boolean; placeholder: Placeholder };
export type VideoTile = { id: string; name: string; city: string; photo: ImageSourcePropType; duration: string; views: string; tint: string };

export const company = {
  name: 'Skyline Hospitality',
  initials: 'SH',
  plan: 'premium' as 'premium' | 'free',
  about:
    'Skyline Hospitality runs rooftop lounges, beach clubs and restaurants across Dubai and Abu Dhabi. We hire hosts, waiters, bartenders and event staff for our venues and private events, and we train every new team member on site.',
  links: [
    { key: 'web', label: 'Website', value: 'skylinehospitality.ae', badge: null },
    { key: 'ig', label: 'Instagram', value: '@skyline.dxb', badge: 'IG' },
    { key: 'in', label: 'LinkedIn', value: 'Skyline Hospitality LLC', badge: 'IN' },
    { key: 'fb', label: 'Facebook', value: 'Skyline Hospitality Dubai', badge: 'FB' },
  ],
  contacts: [
    { key: 'phone', icon: 'call' as const, label: 'Phone', value: '+971 4 555 0199' },
    { key: 'email', icon: 'mail' as const, label: 'Email', value: 'hr@skylinehospitality.ae' },
    { key: 'office', icon: 'location' as const, label: 'Office', value: 'Bay Square 7, Business Bay, Dubai' },
  ],
};

export const me = { firstName: 'Emanuel', lastName: 'Brooks', title: 'HR director', photo: p(10) };

export const team = [
  { id: 'u1', name: 'Emanuel Brooks', you: true, role: 'HR director', admin: true, photo: p(10) },
  { id: 'u2', name: 'Sara Haddad', role: 'Recruiter · Rooftop lounges', photo: p(2) },
  { id: 'u3', name: 'Omar Rahman', role: 'Recruiter · Events', photo: p(9) },
];
export const initialJoinRequests = [{ id: 'j1', name: 'Lina Morozova', email: 'lina.m@skylinehospitality.ae', when: '2 h ago', photo: p(4) }];

export type HireStatus = 'active' | 'review' | 'archive';
export type MyVacancy = {
  id: string;
  title: string;
  meta: string; // "Events · AED 4 500 / event"
  cover: ImageSourcePropType;
  status: HireStatus;
  note: string; // "6 of 7 days left · until 14 Oct" / "Sent 25 min ago" / "Expired 28 Sep · 2 hired"
  daysLeft?: number; // of 7
  urgentLeft?: string; // "18 h left"
  applicants?: number;
  fresh?: number; // new applicants
  faces?: ImageSourcePropType[];
  views?: number;
};

/** EmpHiring: My vacancies (6 = 2 active, 1 on review, 3 in archive). */
export const initialVacancies: MyVacancy[] = [
  {
    id: 'mv1',
    title: 'DJ for a boat party',
    meta: 'Events · AED 4 500 / event',
    cover: img.dj,
    status: 'active',
    note: '6 of 7 days left · until 14 Oct',
    daysLeft: 6,
    urgentLeft: '18 h left',
    applicants: 9,
    fresh: 2,
    faces: [p(10), p(12), p(13)],
    views: 242,
  },
  {
    id: 'mv2',
    title: 'Hostess, rooftop lounge',
    meta: 'Hospitality · AED 15 000 / month',
    cover: img.hostess,
    status: 'active',
    note: '3 of 7 days left · until 11 Oct',
    daysLeft: 3,
    applicants: 24,
    fresh: 5,
    faces: [p(12), p(1), p(2)],
    views: 132,
  },
  { id: 'mv3', title: 'Barista, specialty coffee', meta: 'Hospitality · AED 7 500 / month', cover: img.waiter, status: 'review', note: 'Sent 25 min ago' },
  {
    id: 'mv4',
    title: 'Promo model, car launch',
    meta: 'Model Business · AED 1 200 / day',
    cover: img.dubai1,
    status: 'archive',
    note: 'Expired 28 Sep · 2 hired',
    applicants: 31,
    faces: [p(4), p(3)],
  },
  { id: 'mv5', title: 'Waiter, fine dining', meta: 'Hospitality · AED 9 000 / month', cover: img.misc, status: 'archive', note: 'Closed 21 Sep · 1 hired', applicants: 18, faces: [p(9), p(5)] },
  { id: 'mv6', title: 'Hostess, yacht show', meta: 'Events · AED 800 / day', cover: img.dubai2, status: 'archive', note: 'Expired 12 Sep · 1 hired', applicants: 12, faces: [p(3), p(8)] },
];

export const hireStats = { active: 2, fresh: 7, hired: 4 };

export type EmpThread = {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  online?: boolean;
  time: string;
  /** Contexts: Direct (from the candidate profile) and/or vacancies; "+N" after two. */
  direct?: boolean;
  vacancies?: string[];
  /** Inactive and archive rows show the candidate's role instead. */
  subtitle?: string;
  last: string;
  lastIcon?: 'video';
  mine?: boolean;
  unread: number;
  box: 'active' | 'inactive' | 'archive';
  reason?: 'Declined' | 'Blocked';
};

/** EmpMessages / Inactive / Archive. */
export const initialEmpThreads: EmpThread[] = [
  {
    id: 'e1',
    name: 'Angela R.',
    photo: p(12),
    online: true,
    time: '14:35',
    direct: true,
    vacancies: ['Hostess, rooftop lounge', 'DJ for a boat party'],
    last: 'Yes, I can come for a trial shift on Friday',
    unread: 2,
    box: 'active',
  },
  { id: 'e2', name: 'Ibrahim K.', photo: p(10), time: '12:08', direct: true, last: 'Video presentation', lastIcon: 'video', unread: 1, box: 'active' },
  { id: 'e3', name: 'Elena Sokolova', photo: p(1), time: '10:41', vacancies: ['Promo model, car launch'], last: 'Thank you! See you on Monday at Expo City', mine: true, unread: 0, box: 'active' },
  { id: 'e4', name: 'Sveta V.', photo: p(13), online: true, time: 'Yesterday', vacancies: ['Hostess, rooftop lounge'], last: 'What is the dress code?', unread: 0, box: 'active' },
  { id: 'e5', name: 'Lucas M.', photo: p(14), time: 'Mon', vacancies: ['DJ for a boat party'], direct: true, last: 'Great, I will send the contract tonight', mine: true, unread: 0, box: 'active' },
  { id: 'e6', name: 'Nour A.', photo: p(6), time: 'Sun', vacancies: ['Hostess, rooftop lounge'], last: 'Hello! Is the vacancy still open?', unread: 0, box: 'active' },
  { id: 'e7', name: 'Daria P.', photo: p(8), time: 'Tue', subtitle: 'Hostess · Dubai', last: '', unread: 0, box: 'inactive', reason: 'Declined' },
  { id: 'e8', name: 'Omar H.', photo: p(5), time: '2 Oct', subtitle: 'Bartender · Dubai', last: '', unread: 0, box: 'inactive', reason: 'Blocked' },
  { id: 'e9', name: 'Mira K.', photo: p(4), time: '28 Sep', subtitle: 'Hostess · Dubai', last: 'Thanks, good luck with the event!', unread: 0, box: 'archive' },
  { id: 'e10', name: 'Akmed V.', photo: p(9), time: '21 Sep', subtitle: 'Waiter · Dubai', last: 'The position is filled, thank you', mine: true, unread: 0, box: 'archive' },
  { id: 'e11', name: 'Kira L.', photo: p(3), time: '12 Sep', subtitle: 'Promo model · Dubai', last: 'See you next time 🙂', unread: 0, box: 'archive' },
];

export type EmpNotifKind = 'applicants' | 'accepted' | 'changes' | 'urgent' | 'approved' | 'rejected' | 'expires' | 'declined' | 'premiumSoon' | 'archived' | 'applicant' | 'premiumOver';
export type EmpNotif = {
  id: string;
  kind: EmpNotifKind;
  group: 'applicants' | 'vacancies' | 'messages' | 'subscription';
  title: string;
  text: string;
  time: string;
  day: 'today' | 'earlier';
  unread: boolean;
  /** Candidate photo or vacancy cover; tiles are drawn for the rest. */
  photo?: ImageSourcePropType;
  cover?: ImageSourcePropType;
  action?: string;
};

/** EmpNotificationCenter: New · 4, Today, Earlier. */
export const initialEmpNotifs: EmpNotif[] = [
  {
    id: 'en1',
    kind: 'applicants',
    group: 'applicants',
    title: '3 new applicants for Hostess, rooftop lounge',
    text: 'Angela R., Sveta V. and 1 more applied',
    time: '5 min',
    day: 'today',
    unread: true,
    photo: p(12),
    action: 'View applicants',
  },
  {
    id: 'en2',
    kind: 'accepted',
    group: 'messages',
    title: 'Mia D. accepted your contact request',
    text: 'Direct chat is open — you can write now',
    time: '20 min',
    day: 'today',
    unread: true,
    photo: p(1),
    action: 'Open chat',
  },
  {
    id: 'en3',
    kind: 'changes',
    group: 'vacancies',
    title: 'Changes needed: European female waitresses',
    text: '3 corrections from the 919 team — cover photo, working hours, salary',
    time: '1 h',
    day: 'today',
    unread: true,
    cover: img.waiter,
    action: 'Fix and resubmit',
  },
  { id: 'en4', kind: 'urgent', group: 'vacancies', title: 'Urgent ends in 2 hours', text: 'DJ for a boat party · 9 new applicants since it went urgent', time: '2 h', day: 'today', unread: true },
  {
    id: 'en5',
    kind: 'approved',
    group: 'vacancies',
    title: 'Vacancy approved',
    text: 'Hostess, rooftop lounge is live for 7 days, until 16 Oct',
    time: '10:40',
    day: 'today',
    unread: false,
    cover: img.hostess,
  },
  {
    id: 'en6',
    kind: 'rejected',
    group: 'vacancies',
    title: 'Vacancy rejected: Promoters, training included',
    text: 'Violates 919 rules. Urgent hiring $2.99 will be refunded within 3 business days.',
    time: '10:15',
    day: 'today',
    unread: false,
    cover: img.misc,
  },
  {
    id: 'en7',
    kind: 'expires',
    group: 'vacancies',
    title: 'Promo model, car launch expires tomorrow',
    text: 'Relaunch it for another 7 days to keep receiving applicants',
    time: '09:00',
    day: 'today',
    unread: false,
    action: 'Relaunch',
  },
  {
    id: 'en8',
    kind: 'declined',
    group: 'messages',
    title: 'Mira K. declined your contact request',
    text: 'You can still invite her through a vacancy',
    time: '08:12',
    day: 'today',
    unread: false,
    photo: p(4),
  },
  {
    id: 'en9',
    kind: 'premiumSoon',
    group: 'subscription',
    title: 'Premium expires in 3 days',
    text: 'Your subscription was canceled. Premium features stay until 9 Nov',
    time: 'Mon',
    day: 'earlier',
    unread: false,
    action: 'Renew',
  },
  {
    id: 'en10',
    kind: 'archived',
    group: 'vacancies',
    title: 'Vacancy moved to archive',
    text: 'Barista, specialty coffee was live for 7 days and got 14 applicants',
    time: 'Sun',
    day: 'earlier',
    unread: false,
  },
  {
    id: 'en11',
    kind: 'applicant',
    group: 'applicants',
    title: 'New applicant for Barista, specialty coffee',
    text: 'Sveta V. · 2 years of experience',
    time: 'Sat',
    day: 'earlier',
    unread: false,
    photo: p(8),
  },
  {
    id: 'en12',
    kind: 'premiumOver',
    group: 'subscription',
    title: 'Premium has expired',
    text: 'You’re on the Free plan: 1 active vacancy, chats only via applications',
    time: '2 Oct',
    day: 'earlier',
    unread: false,
    action: 'Get Premium',
  },
];

export type Plan = 'free' | 'premium' | 'canceled';
export type Rep = { firstName: string; lastName: string; position: string; email: string; phone: string; photo: ImageSourcePropType };
export type CompanyInfo = {
  name: string;
  logo?: ImageSourcePropType;
  industry: string;
  size: string;
  founded: string;
  about: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  office: string;
  website: string;
  instagram: string;
  linkedin: string;
  facebook: string;
};
export type Member = { id: string; name: string; role: 'Admin' | 'Recruiter'; title: string; you?: boolean; photo: ImageSourcePropType; vacancies?: number };

export const initialRep: Rep = { firstName: 'Emanuel', lastName: 'Brooks', position: 'HR director', email: 'emanuel@skylinehospitality.ae', phone: '+971 50 123 4567', photo: p(10) };
export const initialInfo: CompanyInfo = {
  name: 'Skyline Hospitality',
  industry: 'Hospitality',
  size: '50–200 employees',
  founded: '2014',
  about: 'Skyline Hospitality runs rooftop lounges, beach clubs and restaurants across Dubai and Abu Dhabi. We hire hosts, waiters, bartenders and event staff for our venues and private events.',
  country: 'United Arab Emirates',
  city: 'Dubai',
  phone: '+971 4 555 0199',
  email: 'hr@skylinehospitality.ae',
  office: 'Bay Square 7, Business Bay, Dubai',
  website: 'skylinehospitality.ae',
  instagram: '@skyline.dxb',
  linkedin: '',
  facebook: 'Skyline Hospitality Dubai',
};
export const initialMembers: Member[] = [
  { id: 'u1', name: 'Emanuel Brooks', role: 'Admin', title: 'HR director', you: true, photo: p(10) },
  { id: 'u2', name: 'Sara Haddad', role: 'Recruiter', title: 'Rooftop lounges', photo: p(2), vacancies: 6 },
  { id: 'u3', name: 'Omar Rahman', role: 'Recruiter', title: 'Events', photo: p(9), vacancies: 2 },
];
/** What deleting an employer account removes (EmpDeleteAccount). */
export const EMPLOYER_LOSSES = ['Your profile, company vacancies, applicants and chats', 'Your Premium subscription will be canceled', 'Payments for the current period are not refunded'];

/** Company initials for the logo tile: "Skyline Hospitality" → "SH". */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '—';
/** Profile completeness for the Edit profile hub. */
export function companyCompleteness(info: CompanyInfo, rep: Rep) {
  const checks = [info.name, info.about, info.industry, info.city, info.phone, info.email, info.office, info.website, info.instagram, info.linkedin, info.facebook, rep.position, rep.email];
  const done = checks.filter((x) => x.trim()).length;
  return Math.round((done / checks.length) * 100);
}

/** Saved talent at start (EmpHiringSaved): candidate ids from the pool and when they were saved. */
export const DEFAULT_SAVED = ['c2', 'c1', 'c3', 'c5', 'c25', 'c13', 'c11', 'c16', 'c22', 'c10', 'c33', 'c32'];
export const savedLabels: Record<string, string> = {
  c2: 'Saved today',
  c1: 'Saved yesterday',
  c3: 'Saved 2 days ago',
  c5: 'Saved 3 days ago',
  c25: 'Saved 5 days ago',
  c13: 'Saved 1 week ago',
  c11: 'Saved 1 week ago',
  c16: 'Saved 2 weeks ago',
  c22: 'Saved 2 weeks ago',
  c10: 'Saved 3 weeks ago',
  c33: 'Saved 1 month ago',
  c32: 'Saved 1 month ago',
};

type Store = {
  threads: EmpThread[];
  moveThread: (id: string, box: EmpThread['box']) => void;
  deleteThread: (id: string) => void;
  /** Direct contact request from a candidate profile (EmpContactSheet → EmpMessagesRequest). */
  addThread: (t: EmpThread) => void;
  vacancies: MyVacancy[];
  /** New vacancy from the posting flow: lands On review, the demo moderation approves it a bit later. */
  addVacancy: (v: MyVacancy) => void;
  updateVacancy: (id: string, u: Partial<MyVacancy>) => void;
  addNotif: (n: EmpNotif) => void;
  unreadTotal: number;
  joinRequests: typeof initialJoinRequests;
  resolveJoin: (id: string) => void;
  notifs: EmpNotif[];
  readNotif: (id: string) => void;
  readAllNotifs: () => void;
  unreadNotifs: number;
  rep: Rep;
  setRep: (u: Partial<Rep>) => void;
  info: CompanyInfo;
  setInfo: (u: Partial<CompanyInfo>) => void;
  plan: Plan;
  setPlan: (p: Plan) => void;
  members: Member[];
  addMember: (m: Member) => void;
  updateMember: (id: string, u: Partial<Member>) => void;
  removeMember: (id: string) => void;
  /** Bookmarked candidates (search results). */
  savedIds: string[];
  toggleSaved: (id: string) => boolean;
};

/** How long the demo moderation takes for a new vacancy. */
const MODERATION_MS = 20_000;

const Ctx = createContext<Store | null>(null);

/** Employer-side state for the prototype: chats and join requests. */
export function EmployerProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState(initialEmpThreads);
  const [joinRequests, setJoin] = useState(initialJoinRequests);
  const [savedIds, setSaved] = useState<string[]>(DEFAULT_SAVED);
  const [notifs, setNotifs] = useState(initialEmpNotifs);
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [rep, setRepState] = useState(initialRep);
  const [info, setInfoState] = useState(initialInfo);
  const [plan, setPlan] = useState<Plan>('premium');
  const [members, setMembers] = useState(initialMembers);
  const value = useMemo<Store>(
    () => ({
      threads,
      moveThread: (id, box) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, box } : t))),
      deleteThread: (id) => setThreads((ts) => ts.filter((t) => t.id !== id)),
      vacancies,
      addVacancy: (v) => {
        setVacancies((vs) => [v, ...vs]);
        // Demo moderation: the 919 team approves the vacancy a little later.
        setTimeout(() => {
          const until = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          setVacancies((vs) => vs.map((x) => (x.id === v.id && x.status === 'review' ? { ...x, status: 'active', daysLeft: 7, note: `7 of 7 days left · until ${until}` } : x)));
          setNotifs((ns) => [
            {
              id: `n${v.id}`,
              kind: 'approved',
              group: 'vacancies',
              title: 'Vacancy approved',
              text: `${v.title} is live for 7 days, until ${until}`,
              time: 'now',
              day: 'today',
              unread: true,
              cover: v.cover,
            },
            ...ns,
          ]);
        }, MODERATION_MS);
      },
      updateVacancy: (id, u) => setVacancies((vs) => vs.map((v) => (v.id === id ? { ...v, ...u } : v))),
      addNotif: (n) => setNotifs((ns) => [n, ...ns]),
      addThread: (t) => setThreads((ts) => [t, ...ts.filter((x) => x.id !== t.id)]),
      unreadTotal: threads.filter((t) => t.box === 'active').reduce((n, t) => n + t.unread, 0),
      joinRequests,
      resolveJoin: (id) => setJoin((js) => js.filter((j) => j.id !== id)),
      notifs,
      readNotif: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n))),
      readAllNotifs: () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
      unreadNotifs: notifs.filter((n) => n.unread).length,
      rep,
      setRep: (u) => setRepState((x) => ({ ...x, ...u })),
      info,
      setInfo: (u) => setInfoState((x) => ({ ...x, ...u })),
      plan,
      setPlan,
      // "You" in the team always mirrors Your profile.
      members: members.map((m) => (m.you ? { ...m, name: `${rep.firstName} ${rep.lastName}`, title: rep.position, photo: rep.photo } : m)),
      addMember: (m) => setMembers((ms) => [...ms, m]),
      updateMember: (id, u) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...u } : m))),
      removeMember: (id) => setMembers((ms) => ms.filter((m) => m.id !== id)),
      savedIds,
      toggleSaved: (id) => {
        const on = !savedIds.includes(id);
        setSaved((xs) => (on ? [id, ...xs] : xs.filter((x) => x !== id)));
        return on;
      },
    }),
    [threads, joinRequests, savedIds, notifs, rep, info, plan, members, vacancies],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEmployer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEmployer must be used inside <EmployerProvider>');
  return v;
}
