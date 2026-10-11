// Mock content for the prototype. Mirrors the canvas screens; replaced by the API later.
import type { Talent, Vacancy } from './types';

const img = {
  dj: require('@/assets/images/mock/dj.jpg'),
  dubai1: require('@/assets/images/mock/dubai1.jpg'),
  dubai2: require('@/assets/images/mock/dubai2.jpg'),
  hostess: require('@/assets/images/mock/hostess.jpg'),
  waiter: require('@/assets/images/mock/waiter.jpg'),
  misc: require('@/assets/images/mock/misc.jpg'),
  barber: require('@/assets/images/mock/barber.jpg'),
};
const p = (n: number) =>
  ({
    0: require('@/assets/images/mock/people/p0.jpg'),
    1: require('@/assets/images/mock/people/p1.jpg'),
    2: require('@/assets/images/mock/people/p2.jpg'),
    3: require('@/assets/images/mock/people/p3.jpg'),
    4: require('@/assets/images/mock/people/p4.jpg'),
    5: require('@/assets/images/mock/people/p5.jpg'),
    6: require('@/assets/images/mock/people/p6.jpg'),
    7: require('@/assets/images/mock/people/p7.jpg'),
    8: require('@/assets/images/mock/people/p8.jpg'),
    9: require('@/assets/images/mock/people/p9.jpg'),
    10: require('@/assets/images/mock/people/p10.jpg'),
    12: require('@/assets/images/mock/people/p12.jpg'),
    13: require('@/assets/images/mock/people/p13.jpg'),
    14: require('@/assets/images/mock/people/p14.jpg'),
  })[n];

const dives = { id: 'dives', name: 'DIVES Holding', initials: 'DH', verified: true };
const desc =
  "Welcome guests at the hotel's beach restaurant, take orders and serve food and drinks during lunch and dinner. Shifts are 8 hours, 5 days a week, with uniform and staff meals provided. Previous experience in a five-star venue is a plus.";

const base = (v: Partial<Vacancy> & Pick<Vacancy, 'id' | 'title' | 'company' | 'pay' | 'cover'>): Vacancy => ({
  sphere: 'hospitality',
  city: 'Dubai',
  country: 'United Arab Emirates',
  urgent: false,
  postedAgo: '2 h ago',
  views: 1240,
  photos: [v.cover, img.misc, img.dubai1],
  details: { role: v.title },
  description: desc,
  requirements: ['English — fluent'],
  ...v,
});

export const vacancies: Vacancy[] = [
  base({ id: 'v1', title: 'DJ for a boat party', company: { id: 'orzu', name: 'ORZU Group', initials: 'OG', verified: true }, sphere: 'events', urgent: true, pay: { amount: 15000, currency: 'AED', contract: 'monthly' }, cover: img.dj }),
  base({ id: 'v2', title: 'Event coordinator, beach festival', company: { id: 'coast', name: 'Coastline Events', initials: 'CE', verified: true }, sphere: 'events', postedAgo: '5 h ago', pay: { amount: 20000, currency: 'AED', contract: 'one-time' }, cover: img.dubai1 }),
  base({ id: 'v3', title: 'Hostess, rooftop lounge', company: { id: 'skyline', name: 'Skyline Hospitality', initials: 'SH', verified: true }, urgent: true, postedAgo: '1 h ago', pay: { amount: 120, currency: 'AED', contract: 'hourly' }, cover: img.hostess }),
  base({
    id: 'v4',
    title: 'European female waitresses',
    company: dives,
    urgent: true,
    views: 2145,
    pay: { amount: 15000, currency: 'AED', contract: 'monthly' },
    cover: img.waiter,
    photos: [img.waiter, img.misc, img.barber, img.dubai1, img.hostess, img.dubai2],
    details: { role: 'Hostess, beach restaurant', gender: 'Female', age: '21–25' },
    requirements: ['English — native', 'Age 21–25', 'Video presentation'],
  }),
  base({ id: 'v5', title: 'Hostess for a car launch', company: { id: 'velocity', name: 'Velocity Events', initials: 'VE', verified: true }, sphere: 'events', urgent: true, postedAgo: '3 h ago', pay: { amount: 1200, currency: 'AED', contract: 'daily' }, cover: img.dubai1 }),
  base({ id: 'v6', title: 'Restaurant hostess, beach club', company: { id: 'azure', name: 'Azure Beach', initials: 'AB', verified: false }, sphere: 'fnb', postedAgo: 'Yesterday', pay: { amount: 90, currency: 'AED', contract: 'hourly' }, cover: img.misc }),
  base({ id: 'v7', title: 'VIP hostess, yacht show', company: { id: 'marina', name: 'Marina Yachts', initials: 'MY', verified: true }, sphere: 'events', postedAgo: '2 d ago', pay: { amount: 800, currency: 'AED', contract: 'daily' }, cover: img.dubai2 }),
  base({ id: 'v8', title: 'Barista, specialty coffee bar', company: { id: 'brew', name: 'Brew Lab', initials: 'BL', verified: true }, sphere: 'fnb', postedAgo: '6 h ago', pay: { amount: 6500, currency: 'AED', contract: 'monthly' }, cover: img.barber }),
  base({ id: 'v9', title: 'Promo models for a fashion week', company: { id: 'atelier', name: 'Atelier Gulf', initials: 'AG', verified: true }, sphere: 'modeling', postedAgo: '8 h ago', pay: { amount: 2500, currency: 'AED', contract: 'fixed-term' }, cover: img.dubai2 }),
  // Not in the public feed: referenced by the seeker's applications and saved list.
  base({ id: 'v10', title: 'Barber, premium salon', company: { id: 'gents', name: 'Gentlemen’s Club', initials: 'GC', verified: true }, sphere: 'beauty', postedAgo: '5 h ago', pay: { amount: 8000, currency: 'AED', contract: 'monthly' }, cover: img.barber }),
  base({ id: 'v11', title: 'Hostess, yacht club', company: { id: 'myc', name: 'Marina Yacht Club', initials: 'MY', verified: true }, postedAgo: 'Yesterday', pay: { amount: 600, currency: 'AED', contract: 'daily' }, cover: img.hostess }),
  base({ id: 'v12', title: 'Resident DJ, beach bar', company: { id: 'sunset', name: 'Sunset Beach', initials: 'SB', verified: true }, sphere: 'music', postedAgo: '4 d ago', pay: { amount: 12000, currency: 'AED', contract: 'monthly' }, cover: img.dj }),
  base({ id: 'v13', title: 'Promo model, car launch', company: { id: 'prestige', name: 'Prestige Events', initials: 'PE', verified: true }, sphere: 'modeling', postedAgo: '1 d ago', pay: { amount: 1200, currency: 'AED', contract: 'daily' }, cover: img.dubai2 }),
  base({ id: 'v14', title: 'Promo model, auto show', company: { id: 'prestige', name: 'Prestige Events', initials: 'PE', verified: true }, sphere: 'modeling', postedAgo: '2 d ago', pay: { amount: 1500, currency: 'AED', contract: 'daily' }, cover: img.dubai1 }),
  base({ id: 'v15', title: 'Waiter, fine dining', company: { id: 'atlantis', name: 'Atlantis The Palm', initials: 'AP', verified: true }, sphere: 'fnb', postedAgo: '3 w ago', pay: { amount: 8000, currency: 'AED', contract: 'monthly' }, cover: img.waiter }),
  base({ id: 'v16', title: 'DJ, New Year party', company: { id: 'orzu', name: 'ORZU Group', initials: 'OG', verified: true }, sphere: 'music', postedAgo: '10 mo ago', pay: { amount: 3000, currency: 'AED', contract: 'one-time' }, cover: img.dj }),
  base({ id: 'v17', title: 'Bartender, pop-up bar', company: { id: 'brew', name: 'Brew Lab', initials: 'BL', verified: true }, sphere: 'fnb', postedAgo: '1 mo ago', pay: { amount: 700, currency: 'AED', contract: 'daily' }, cover: img.barber }),
];

/** Vacancies shown in feeds; the rest exist only in a seeker's history. */
export const feedVacancies = vacancies.slice(0, 9);

export const talents: Talent[] = [
  { id: 't1', name: 'Angela R.', role: 'Hostess', city: 'Dubai', verified: true, premium: true, sphere: 'hospitality', photo: p(1), placeholder: 1 },
  { id: 't2', name: 'Ibrahim K.', role: 'Bartender', city: 'Dubai', verified: true, premium: false, sphere: 'hospitality', photo: p(10), placeholder: 2 },
  { id: 't3', name: 'Sofia L.', role: 'Model', city: 'Dubai', verified: true, premium: true, sphere: 'modeling', photo: p(8), placeholder: 3 },
  { id: 't4', name: 'Nour A.', role: 'Bartender', city: 'Abu Dhabi', verified: true, premium: false, sphere: 'hospitality', photo: p(9), placeholder: 4 },
  { id: 't5', name: 'Layla H.', role: 'Waitress', city: 'Dubai', verified: false, premium: true, sphere: 'hospitality', photo: p(13), placeholder: 1 },
  { id: 't6', name: 'Lucas M.', role: 'DJ', city: 'Dubai', verified: true, premium: false, sphere: 'music', photo: p(14), placeholder: 5 },
  { id: 't7', name: 'Mira K.', role: 'Hostess', city: 'Dubai', verified: true, premium: false, sphere: 'hospitality', photo: p(2), placeholder: 2 },
  { id: 't8', name: 'Wakako T.', role: 'Promo, hostess', city: 'Dubai', verified: true, premium: true, sphere: 'events', photo: p(3), placeholder: 3 },
];

export const findVacancy = (id: string) => vacancies.find((v) => v.id === id);
