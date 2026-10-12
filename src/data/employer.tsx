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

/** Talent home: one horizontal row per field (TalentProfiles). */
export const talentRows: { key: string; title: string; count: string; people: TalentTile[] }[] = [
  {
    key: 'hospitality',
    title: 'Hospitality',
    count: '1 459',
    people: [
      { id: 'h1', name: 'Angela', role: 'Hostess', city: 'Dubai', photo: p(1), placeholder: 4 },
      { id: 'h2', name: 'Ibrahim', role: 'Waiter', city: 'Dubai', photo: p(10), premium: true, placeholder: 2 },
      { id: 'h3', name: 'Layla', role: 'Hostess', city: 'Dubai', photo: p(2), placeholder: 1 },
      { id: 'h4', name: 'Mira', role: 'Bartender', city: 'Dubai', photo: p(4), placeholder: 3 },
    ],
  },
  {
    key: 'model',
    title: 'Model Business',
    count: '842',
    people: [
      { id: 'm1', name: 'Sofia', role: 'Model', city: 'Dubai', photo: p(13), premium: true, placeholder: 3 },
      { id: 'm2', name: 'Wakako', role: 'Model', city: 'Kyoto', photo: p(14), placeholder: 5 },
      { id: 'm3', name: 'Nadia', role: 'Model', city: 'Dubai', photo: p(0), placeholder: 4 },
      { id: 'm4', name: 'Kira', role: 'Promo model', city: 'Dubai', photo: p(3), placeholder: 1 },
    ],
  },
  {
    key: 'service',
    title: 'Service',
    count: '3 509',
    people: [
      { id: 's1', name: 'Anna', role: 'Barista', city: 'Moscow', photo: p(8), placeholder: 1 },
      { id: 's2', name: 'Zaurbek', role: 'Driver', city: 'Almaty', photo: p(9), placeholder: 4 },
      { id: 's3', name: 'Omar', role: 'Valet', city: 'Dubai', photo: p(10), placeholder: 2 },
      { id: 's4', name: 'Sveta', role: 'Hostess', city: 'Dubai', photo: p(5), placeholder: 3 },
    ],
  },
];

/** Talent home, Videos tab (TalentVideos). */
export const videoRows: { key: string; title: string; count: string; videos: VideoTile[] }[] = [
  {
    key: 'model',
    title: 'Model Business',
    count: '312',
    videos: [
      { id: 'v1', name: 'Elena Sokolova', city: 'Dubai', photo: p(1), duration: '0:42', views: '12.4k', tint: '#2C2140' },
      { id: 'v2', name: 'Chen', city: 'Dubai', photo: p(2), duration: '0:30', views: '9.1k', tint: '#1B2A44' },
      { id: 'v3', name: 'Tara', city: 'Dubai', photo: p(13), duration: '0:55', views: '8.6k', tint: '#3A2418' },
    ],
  },
  {
    key: 'hospitality',
    title: 'Hospitality',
    count: '527',
    videos: [
      { id: 'v4', name: 'Masha', city: 'Dubai', photo: p(14), duration: '0:38', views: '6.2k', tint: '#13302A' },
      { id: 'v5', name: 'Boris Azat', city: 'Dubai', photo: p(10), duration: '1:04', views: '4.9k', tint: '#1A1F2B' },
      { id: 'v6', name: 'Zoey', city: 'Dubai', photo: p(0), duration: '0:27', views: '3.7k', tint: '#1B2A44' },
    ],
  },
];

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
export const myVacancies: MyVacancy[] = [
  { id: 'mv1', title: 'DJ for a boat party', meta: 'Events · AED 4 500 / event', cover: img.dj, status: 'active', note: '6 of 7 days left · until 14 Oct', daysLeft: 6, urgentLeft: '18 h left', applicants: 9, fresh: 2, faces: [p(10), p(12), p(13)], views: 242 },
  { id: 'mv2', title: 'Hostess, rooftop lounge', meta: 'Hospitality · AED 15 000 / month', cover: img.hostess, status: 'active', note: '3 of 7 days left · until 11 Oct', daysLeft: 3, applicants: 24, fresh: 5, faces: [p(12), p(1), p(2)], views: 132 },
  { id: 'mv3', title: 'Barista, specialty coffee', meta: 'Hospitality · AED 7 500 / month', cover: img.waiter, status: 'review', note: 'Sent 25 min ago' },
  { id: 'mv4', title: 'Promo model, car launch', meta: 'Model Business · AED 1 200 / day', cover: img.dubai1, status: 'archive', note: 'Expired 28 Sep · 2 hired', applicants: 31, faces: [p(4), p(3)] },
  { id: 'mv5', title: 'Waiter, fine dining', meta: 'Hospitality · AED 9 000 / month', cover: img.misc, status: 'archive', note: 'Closed 21 Sep · 1 hired', applicants: 18, faces: [p(9), p(5)] },
  { id: 'mv6', title: 'Hostess, yacht show', meta: 'Events · AED 800 / day', cover: img.dubai2, status: 'archive', note: 'Expired 12 Sep · 1 hired', applicants: 12, faces: [p(3), p(8)] },
];

export const hireStats = { active: 2, fresh: 7, hired: 4 };

/** EmpHiringSaved: 12 saved candidates. */
export const savedTalent: (TalentTile & { field: 'hospitality' | 'model' | 'events'; saved: string })[] = [
  { id: 'st1', name: 'Angela R.', role: 'Hostess', city: 'Dubai', photo: p(1), premium: true, placeholder: 4, field: 'hospitality', saved: 'Saved today' },
  { id: 'st2', name: 'Ibrahim K.', role: 'Bartender', city: 'Dubai', photo: p(10), placeholder: 2, field: 'hospitality', saved: 'Saved yesterday' },
  { id: 'st3', name: 'Elena S.', role: 'Promo model', city: 'Dubai', photo: p(13), premium: true, placeholder: 3, field: 'model', saved: 'Saved 2 days ago' },
  { id: 'st4', name: 'Akmed V.', role: 'Waiter', city: 'Dubai', photo: p(9), placeholder: 4, field: 'hospitality', saved: 'Saved 3 days ago' },
  { id: 'st5', name: 'Sveta V.', role: 'Hostess', city: 'Dubai', photo: p(5), placeholder: 1, field: 'hospitality', saved: 'Saved 5 days ago' },
  { id: 'st6', name: 'Lucas M.', role: 'Head bartender', city: 'Dubai', photo: p(14), placeholder: 5, field: 'hospitality', saved: 'Saved 1 week ago' },
  { id: 'st7', name: 'Sofia L.', role: 'Model', city: 'Dubai', photo: p(8), placeholder: 3, field: 'model', saved: 'Saved 1 week ago' },
  { id: 'st8', name: 'Kira L.', role: 'Promo model', city: 'Dubai', photo: p(3), placeholder: 1, field: 'model', saved: 'Saved 2 weeks ago' },
  { id: 'st9', name: 'Nadia O.', role: 'Model', city: 'Dubai', photo: p(0), placeholder: 4, field: 'model', saved: 'Saved 2 weeks ago' },
  { id: 'st10', name: 'Mira K.', role: 'Hostess, events', city: 'Dubai', photo: p(4), placeholder: 2, field: 'events', saved: 'Saved 3 weeks ago' },
  { id: 'st11', name: 'Omar H.', role: 'Event host', city: 'Abu Dhabi', photo: p(6), placeholder: 5, field: 'events', saved: 'Saved 1 month ago' },
  { id: 'st12', name: 'Wakako T.', role: 'Promo, hostess', city: 'Dubai', photo: p(2), premium: true, placeholder: 3, field: 'events', saved: 'Saved 1 month ago' },
];

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
  { id: 'e1', name: 'Angela R.', photo: p(12), online: true, time: '14:35', direct: true, vacancies: ['Hostess, rooftop lounge', 'DJ for a boat party'], last: 'Yes, I can come for a trial shift on Friday', unread: 2, box: 'active' },
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
  { id: 'en1', kind: 'applicants', group: 'applicants', title: '3 new applicants for Hostess, rooftop lounge', text: 'Angela R., Sveta V. and 1 more applied', time: '5 min', day: 'today', unread: true, photo: p(12), action: 'View applicants' },
  { id: 'en2', kind: 'accepted', group: 'messages', title: 'Mia D. accepted your contact request', text: 'Direct chat is open — you can write now', time: '20 min', day: 'today', unread: true, photo: p(1), action: 'Open chat' },
  { id: 'en3', kind: 'changes', group: 'vacancies', title: 'Changes needed: European female waitresses', text: '3 corrections from the 919 team — cover photo, working hours, salary', time: '1 h', day: 'today', unread: true, cover: img.waiter, action: 'Fix and resubmit' },
  { id: 'en4', kind: 'urgent', group: 'vacancies', title: 'Urgent ends in 2 hours', text: 'DJ for a boat party · 9 new applicants since it went urgent', time: '2 h', day: 'today', unread: true },
  { id: 'en5', kind: 'approved', group: 'vacancies', title: 'Vacancy approved', text: 'Hostess, rooftop lounge is live for 7 days, until 16 Oct', time: '10:40', day: 'today', unread: false, cover: img.hostess },
  { id: 'en6', kind: 'rejected', group: 'vacancies', title: 'Vacancy rejected: Promoters, training included', text: 'Violates 919 rules. Urgent hiring $2.99 will be refunded within 3 business days.', time: '10:15', day: 'today', unread: false, cover: img.misc },
  { id: 'en7', kind: 'expires', group: 'vacancies', title: 'Promo model, car launch expires tomorrow', text: 'Relaunch it for another 7 days to keep receiving applicants', time: '09:00', day: 'today', unread: false, action: 'Relaunch' },
  { id: 'en8', kind: 'declined', group: 'messages', title: 'Mira K. declined your contact request', text: 'You can still invite her through a vacancy', time: '08:12', day: 'today', unread: false, photo: p(4) },
  { id: 'en9', kind: 'premiumSoon', group: 'subscription', title: 'Premium expires in 3 days', text: 'Your subscription was canceled. Premium features stay until 9 Nov', time: 'Mon', day: 'earlier', unread: false, action: 'Renew' },
  { id: 'en10', kind: 'archived', group: 'vacancies', title: 'Vacancy moved to archive', text: 'Barista, specialty coffee was live for 7 days and got 14 applicants', time: 'Sun', day: 'earlier', unread: false },
  { id: 'en11', kind: 'applicant', group: 'applicants', title: 'New applicant for Barista, specialty coffee', text: 'Sveta V. · 2 years of experience', time: 'Sat', day: 'earlier', unread: false, photo: p(8) },
  { id: 'en12', kind: 'premiumOver', group: 'subscription', title: 'Premium has expired', text: 'You’re on the Free plan: 1 active vacancy, chats only via applications', time: '2 Oct', day: 'earlier', unread: false, action: 'Get Premium' },
];

type Store = {
  threads: EmpThread[];
  moveThread: (id: string, box: EmpThread['box']) => void;
  deleteThread: (id: string) => void;
  unreadTotal: number;
  joinRequests: typeof initialJoinRequests;
  resolveJoin: (id: string) => void;
  notifs: EmpNotif[];
  readNotif: (id: string) => void;
  readAllNotifs: () => void;
  unreadNotifs: number;
  /** Bookmarked candidates (search results). */
  savedIds: string[];
  toggleSaved: (id: string) => boolean;
};

const Ctx = createContext<Store | null>(null);

/** Employer-side state for the prototype: chats and join requests. */
export function EmployerProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState(initialEmpThreads);
  const [joinRequests, setJoin] = useState(initialJoinRequests);
  const [savedIds, setSaved] = useState<string[]>([]);
  const [notifs, setNotifs] = useState(initialEmpNotifs);
  const value = useMemo<Store>(
    () => ({
      threads,
      moveThread: (id, box) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, box } : t))),
      deleteThread: (id) => setThreads((ts) => ts.filter((t) => t.id !== id)),
      unreadTotal: threads.filter((t) => t.box === 'active').reduce((n, t) => n + t.unread, 0),
      joinRequests,
      resolveJoin: (id) => setJoin((js) => js.filter((j) => j.id !== id)),
      notifs,
      readNotif: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n))),
      readAllNotifs: () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))),
      unreadNotifs: notifs.filter((n) => n.unread).length,
      savedIds,
      toggleSaved: (id) => {
        const on = !savedIds.includes(id);
        setSaved((xs) => (on ? [id, ...xs] : xs.filter((x) => x !== id)));
        return on;
      },
    }),
    [threads, joinRequests, savedIds, notifs],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEmployer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEmployer must be used inside <EmployerProvider>');
  return v;
}
