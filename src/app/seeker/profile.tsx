import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, FramedAvatar, Icon, IconButton, Pressable, TAB_BAR_SPACE, Text, TierBadge } from '@/components';
import { mockImg } from '@/data/mock';
import { fieldByKey } from '@/data/registration';
import { completeness, jobPeriod, linkKinds, studyPeriod, totalExperience, useSeeker } from '@/data/seeker';
import type { FieldEntry } from '@/data/signup';
import { AvailCard } from '@/features/availability/Available';
import { openPhotos, openVideo } from '@/features/media/viewer';
import { PlanChip } from '@/features/profile/seekerPlan';
import { CodeTile, Completeness, Panel, TimelineItem } from '@/features/profile/ui';
import { useTheme } from '@/theme';
import { SeekerProfileSkeleton } from '@/features/skeletons/SeekerProfileSkeleton';
import { useFirstLoad } from '@/features/skeletons/useFirstLoad';

const DETAIL_ROWS: [string, string, string?][] = [
  ['appearance', 'Appearance'],
  ['height', 'Height', 'cm'],
  ['weight', 'Weight', 'kg'],
  ['shoe', 'Shoe size', 'EU'],
  ['genre', 'Genre'],
];

function Pill({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
      <Text variant="bodyS" weight={600} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </View>
  );
}

function OccupationCard({ o }: { o: FieldEntry }) {
  const { c } = useTheme();
  const rows = DETAIL_ROWS.filter(([k]) => o.details[k]);
  return (
    <Panel title={fieldByKey(o.field).label}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {o.roles.map((r) => (
          <Pill key={r} label={r} />
        ))}
      </View>
      {rows.length ? (
        <View>
          {rows.map(([k, label, unit], i) => (
            <View key={k} style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
                {label}
              </Text>
              <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                {o.details[k]}
                {unit ? ` ${unit}` : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Panel>
  );
}

/** Seeker profile — what employers see. Editing lives behind the pencil (Edit profile), as in the design. */
export default function Profile() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile: p, hidden, plan, look } = useSeeker();
  const [more, setMore] = useState(false);
  const loading = useFirstLoad('seeker-profile');
  const max = plan === 'max';
  const comp = completeness(p);
  const photos = p.photos.filter((x) => x.progress === undefined);
  const location = [p.city, p.country].filter(Boolean).join(', ');
  const name = `${p.firstName} ${p.lastName}`.trim() || 'Your name';
  const longAbout = p.about.length > 150;
  const open = (v: string) => Linking.openURL(/^https?:\/\//.test(v) ? v : v.startsWith('@') ? `https://instagram.com/${v.slice(1)}` : `https://${v}`).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 16, gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 4 }}>
          <Text variant="displayL" accessibilityRole="header" style={{ flex: 1, fontSize: 24, lineHeight: 30 }}>
            Profile
          </Text>
          {plan !== 'free' ? (
            <Pressable onPress={() => router.push('/profile/subscription')} accessibilityRole="button" accessibilityLabel="Your subscription">
              <PlanChip tier={plan} />
            </Pressable>
          ) : null}
          <IconButton icon="edit" label="Edit profile" onPress={() => router.push('/profile/edit')} />
          <IconButton icon="settings" label="Settings" onPress={() => router.push('/profile/settings')} />
        </View>

        {loading ? (
          <SeekerProfileSkeleton />
        ) : (
          <>
        <AvailCard />

        {hidden ? (
          <Panel>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="eye-off" size={20} color="textBody" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight={700}>
                  Your profile is hidden from employers
                </Text>
                <Text variant="body" color="textPrimary" style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
                  You turned off visibility. Employers can’t find you in talent search or invite you to vacancies. Turn it back on in{' '}
                  <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }} onPress={() => router.push('/profile/edit')} accessibilityRole="link">
                    Edit profile
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </Panel>
        ) : comp.search.length ? (
          <Panel gap={14}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.infoBack, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="alert-circle" size={20} color="infoText" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight={700}>
                  Employers can’t find you yet
                </Text>
                <Text variant="body" color="textPrimary" style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
                  Your profile is hidden from search until these are filled in.
                </Text>
              </View>
            </View>
            <Completeness percent={comp.percent} tone="warning" />
            <View>
              {comp.search.map((it, i) => (
                <Pressable
                  key={it.key}
                  onPress={() => router.push('/profile/general')}
                  accessibilityRole="link"
                  style={{ height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: i < comp.search.length - 1 ? 1 : 0, borderColor: c.divider }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.stroke }} />
                  <Text variant="body" style={{ flex: 1, fontSize: 15 }}>
                    {it.hint}
                  </Text>
                  {it.count ? (
                    <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                      {it.count}
                    </Text>
                  ) : null}
                  <Icon name="chevron-right" size={18} color="textBody" />
                </Pressable>
              ))}
            </View>
            <Button size="m" label="Complete profile" onPress={() => router.push('/profile/general')} />
          </Panel>
        ) : null}

        {/* header card */}
        <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
          {max && look.header ? (
            <View>
              <Image source={mockImg.dubai2} contentFit="cover" accessibilityLabel="Your profile header" style={{ height: 132, backgroundColor: c.primarySecondary }} />
              <Pressable
                onPress={() => router.push('/profile/look')}
                accessibilityRole="button"
                style={{ position: 'absolute', right: 12, top: 12, height: 32, paddingLeft: 10, paddingRight: 12, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.55)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="sparkles" size={16} color="#FFFFFF" />
                <Text variant="caption" weight={700} color="#FFFFFF">
                  Edit look
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ height: p.photo ? 88 : 72, backgroundColor: c.primarySecondary }} />
          )}
          <View style={{ paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center' }}>
            {p.photo ? (
              <Pressable onPress={() => openPhotos({ photos: [p.photo!], index: 0 })} accessibilityRole="imagebutton" accessibilityLabel="Open profile photo" style={{ marginTop: max && look.frame ? -56 : -52 }}>
                <FramedAvatar frame={max ? look.frame : undefined} size={max && look.frame ? 112 : 104} ring={5} gap={max && look.frame ? 3 : 4} bg={c.surface}>
                  <Image source={p.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%', backgroundColor: c.avatar3 }} />
                </FramedAvatar>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/profile/edit')}
                accessibilityRole="button"
                accessibilityLabel="Add profile photo"
                style={{ marginTop: -44, width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: c.surface, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="camera" size={26} color="textBody" />
              </Pressable>
            )}
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
                {name}
              </Text>
              <TierBadge tier={plan} size={22} />
            </View>
            <Text variant="body" color="textBody" style={{ marginTop: 6, fontSize: 14 }}>
              {[p.age ? `${p.age} years` : null, p.gender].filter(Boolean).join(' · ')}
            </Text>
            {location ? (
              <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="location" size={16} color="textBody" />
                <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
                  {location}
                </Text>
              </View>
            ) : null}
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
              {p.occupations.map((o) => (
                <View key={o.field} style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.primarySecondary, justifyContent: 'center' }}>
                  <Text variant="caption" weight={600} color="link">
                    {fieldByKey(o.field).label} · {o.roles[0]}
                  </Text>
                </View>
              ))}
            </View>
            {p.photo ? (
              <View style={{ alignSelf: 'stretch', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderColor: c.divider, flexDirection: 'row' }}>
                {[
                  [p.stats.views, 'Profile views'],
                  [p.stats.applications, 'Applications'],
                  [p.stats.invites, 'Invites'],
                ].map(([v, l]) => (
                  <View key={l} style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="title" style={{ fontSize: 17, lineHeight: 22 }}>
                      {v}
                    </Text>
                    <Text variant="caption" weight={400} color="textBody" style={{ marginTop: 2 }}>
                      {l}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <Panel
          title={undefined}
          gap={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyL" weight={700} accessibilityRole="header">
              Photos{' '}
              <Text variant="bodyL" weight={500} color="textBody">
                {photos.length}
              </Text>
            </Text>
            <Pressable onPress={() => router.push('/profile/general')} accessibilityRole="button" accessibilityLabel="Add photos" hitSlop={8} style={{ height: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="add" size={18} color="link" />
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                Add
              </Text>
            </Pressable>
          </View>
          {photos.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
              {photos.slice(0, 9).map((ph, i) => (
                <Pressable key={ph.id} onPress={() => openPhotos({ photos: photos.map((x) => x.source), index: i })} accessibilityRole="imagebutton" accessibilityLabel={`Photo ${i + 1} of ${photos.length}`} style={{ width: '33.333%', padding: 4 }}>
                  <Image source={ph.source} contentFit="cover" contentPosition={{ top: '25%' }} style={{ height: 136, borderRadius: 16, backgroundColor: c.avatar4 }} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </Panel>

        {p.video ? (
          <Panel
            title="Video presentation"
            right={
              <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="view" size={14} color="successText" />
                <Text variant="caption" weight={700} color="successText">
                  {p.stats.videoViews} views
                </Text>
              </View>
            }>
            <Pressable
              onPress={() =>
                openVideo({
                  own: true,
                  poster: p.video!.poster,
                  duration: p.video!.duration,
                  label: 'Your video presentation',
                  name,
                  tier: plan,
                  avatar: p.photo,
                  subtitle: [p.occupations[0]?.roles[0], p.city, `${p.stats.videoViews} views`].filter(Boolean).join(' · '),
                  text: p.about,
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Play video presentation"
              style={{ height: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: '#232426', alignItems: 'center' }}>
              <Image source={p.video.poster} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 130, height: 200, backgroundColor: '#2C2140' }} />
              <View style={{ position: 'absolute', top: 74, width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={22} color="#18191C" />
              </View>
              <View style={{ position: 'absolute', right: 10, bottom: 10, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(24,25,27,0.7)', justifyContent: 'center' }}>
                <Text variant="caption" weight={600} color="#FFFFFF">
                  {p.video.duration}
                </Text>
              </View>
            </Pressable>
          </Panel>
        ) : null}

        {p.about ? (
          <Panel title="About" gap={8}>
            <Text variant="body" color="textPrimary" numberOfLines={more ? undefined : 4} style={{ fontSize: 15, lineHeight: 22 }}>
              {p.about}
            </Text>
            {longAbout ? (
              <Pressable onPress={() => setMore(!more)} accessibilityRole="button" style={{ alignSelf: 'flex-start', height: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                  {more ? 'Show less' : 'Show more'}
                </Text>
                <View style={{ transform: [{ rotate: more ? '180deg' : '0deg' }] }}>
                  <Icon name="chevron-down" size={16} color="link" />
                </View>
              </Pressable>
            ) : null}
          </Panel>
        ) : null}

        {p.languages.length ? (
          <Panel title="Languages" list>
            {p.languages.map((l, i) => (
              <View key={l.code} style={{ height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < p.languages.length - 1 ? 1 : 0, borderColor: c.divider }}>
                <CodeTile code={l.code} />
                <Text variant="body" style={{ flex: 1, fontSize: 15 }}>
                  {l.name}
                </Text>
                <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                  {l.level}
                </Text>
              </View>
            ))}
          </Panel>
        ) : null}

        {p.experience.length ? (
          <Panel
            title="Experience"
            list
            right={
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                {totalExperience(p.experience)}
              </Text>
            }>
            {p.experience.map((j, i) => (
              <TimelineItem key={j.id} title={j.role} sub={`${j.company} · ${j.city}`} meta={jobPeriod(j)} last={i === p.experience.length - 1} />
            ))}
          </Panel>
        ) : null}

        {p.education.length ? (
          <Panel title="Education" list>
            {p.education.map((e, i) => (
              <TimelineItem key={e.id} title={[e.degree, e.field].filter(Boolean).join(', ')} sub={e.institution} meta={studyPeriod(e)} last={i === p.education.length - 1} />
            ))}
          </Panel>
        ) : null}

        {p.occupations.map((o) => (
          <OccupationCard key={o.field} o={o} />
        ))}

        {p.links.length ? (
          <Panel title="Portfolio and socials" list>
            {p.links.map((l, i) => {
              const k = linkKinds[l.kind];
              return (
                <Pressable
                  key={l.id}
                  onPress={() => open(l.value)}
                  accessibilityRole="link"
                  accessibilityLabel={`${k.label}: ${l.value}`}
                  style={{ height: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < p.links.length - 1 ? 1 : 0, borderColor: c.divider }}>
                  {l.kind === 'web' ? (
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="globe" size={18} color="primary" />
                    </View>
                  ) : (
                    <CodeTile code={k.code} size={36} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                      {k.label}
                    </Text>
                    <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                      {l.value.replace(/^https?:\/\//, '').replace(/^(soundcloud\.com\/)/, '@')}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="textBody" />
                </Pressable>
              );
            })}
          </Panel>
        ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
