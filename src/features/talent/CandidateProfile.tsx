import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, EmptyState, FramedAvatar, Icon, IconButton, Pressable, Text, TierBadge, useToast } from '@/components';
import { profileOf, sphereChip } from '@/data/candidateProfile';
import { useEmployer } from '@/data/employer';
import { mockImg } from '@/data/mock';
import { findCandidate } from '@/data/talentPool';
import { PremiumSheet } from '@/features/hire/PremiumSheet';
import { openPhotos, openVideo } from '@/features/media/viewer';
import { CodeTile, Panel, TimelineItem } from '@/features/profile/ui';
import { useTheme } from '@/theme';

// One mock photo per person: full frame, then two closer crops, so the set reads as different shots.
const CROPS = [
  { scale: 1, pos: { top: '25%' } },
  { scale: 1.8, pos: { top: '18%', left: '35%' } },
  { scale: 1.45, pos: { top: '80%', left: '60%' } },
  { scale: 1.25, pos: { top: '40%', left: '20%' } },
  { scale: 2.1, pos: { top: '30%', left: '55%' } },
  { scale: 1.6, pos: { top: '60%', left: '40%' } },
] as const;

/** Plan limits drive what a profile can show (product rules §12): Free 10 photos / 1 video, Premium and Max 20 / 5. */
const mediaOf = (tier: string | undefined, base: number) => (tier === 'max' ? { photos: 14, videos: 3 } : tier === 'premium' ? { photos: 9, videos: 2 } : { photos: base, videos: 1 });
const VIDEO_TITLES = ['Video presentation', 'At work', 'Behind the scenes'];

/**
 * Seeker profile as someone else sees it. `employer` (EmpSeekerProfile): save, CV, contact request (EmpContactSheet)
 * or paywall (EmpPaywallContact). `seeker` (SeekPeopleProfile): the same page from People, read-only — no top
 * actions and no contact button. Max profiles show the custom header, the frame and more photos and videos.
 */
export function CandidateProfile({ viewer = 'employer' }: { viewer?: 'employer' | 'seeker' }) {
  const seekerView = viewer === 'seeker';
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { savedIds, toggleSaved, plan, setPlan, requestContact, threads } = useEmployer();
  const [more, setMore] = useState(false);
  const [sheet, setSheet] = useState<'contact' | 'paywall' | null>(null);
  const [msg, setMsg] = useState('');
  const cand = findCandidate(id);

  if (!cand) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <IconButton icon="arrow-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.navigate(seekerView ? '/seeker/people' : '/hire'))} />
        <EmptyState icon="user" title="Profile not available" text="The candidate hid the profile or deleted the account." passive />
      </View>
    );
  }
  const p = profileOf(cand);
  const media = mediaOf(cand.tier, p.gallery.length);
  const max = cand.tier === 'max';
  const tiles = media.photos > 3 ? [...p.gallery, ...p.gallery].slice(0, 6) : p.gallery;
  const first = cand.name.split(' ')[0];
  const saved = savedIds.includes(cand.id);
  const chat = threads.find((t) => t.candidateId === cand.id && t.state !== 'deleted');
  const open = (v: string, kind: string) =>
    Linking.openURL(kind === 'ig' ? `https://instagram.com/${v.slice(1)}` : kind === 'sc' ? `https://soundcloud.com/${v.slice(1)}` : kind === 'fb' ? 'https://facebook.com' : `https://${v}`).catch(
      () => {},
    );

  const contact = () => {
    if (chat) return router.push({ pathname: '/hire-chat/[id]', params: { id: chat.id } });
    setSheet(plan === 'free' ? 'paywall' : 'contact');
  };
  const send = () => {
    const id = requestContact(cand.id, msg);
    setSheet(null);
    setMsg('');
    toast({ text: `Request sent. You can chat once ${first} accepts it`, icon: 'message' });
    router.push({ pathname: '/hire-chat/[id]', params: { id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + (seekerView ? 40 : 110), gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconButton icon="arrow-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.navigate(seekerView ? '/seeker/people' : '/hire'))} />
          <View style={{ flex: 1 }} />
          {seekerView ? null : (
            <>
          <IconButton
            icon={saved ? 'bookmark-filled' : 'bookmark'}
            label={saved ? 'Remove from saved' : 'Save profile'}
            onPress={() => {
              const on = toggleSaved(cand.id);
              toast({ text: on ? 'Saved to Saved talent' : 'Removed from Saved talent', icon: on ? 'bookmark-filled' : 'bookmark' });
            }}
          />
          <Pressable
            onPress={() => toast({ text: `${p.fullName} — CV.pdf downloaded`, icon: 'download' })}
            accessibilityRole="button"
            accessibilityLabel="Download CV"
            style={{ height: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={18} color="textHeadline" />
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              CV
            </Text>
          </Pressable>
            </>
          )}
        </View>

        {/* header card */}
        <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
          {max ? (
            <Image source={mockImg.dubai1} contentFit="cover" accessibilityLabel={`${first}'s profile header`} style={{ height: 132, backgroundColor: c.primarySecondary }} />
          ) : (
            <View style={{ height: 88, backgroundColor: c.primarySecondary }} />
          )}
          <View style={{ paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center' }}>
            <Pressable onPress={() => openPhotos({ photos: [cand.photo], index: 0 })} accessibilityRole="imagebutton" accessibilityLabel="Open profile photo" style={{ marginTop: max ? -56 : -52 }}>
              <FramedAvatar frame={cand.frame} size={max ? 112 : 104} ring={5} gap={max ? 3 : 4} bg={c.surface}>
                <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%', backgroundColor: c.avatar3 }} />
              </FramedAvatar>
            </Pressable>
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
                {p.fullName}
              </Text>
              <TierBadge tier={cand.tier} size={22} />
            </View>
            <Text variant="body" color="textBody" style={{ marginTop: 6, fontSize: 14 }}>
              {cand.age} years · {cand.gender === 'female' ? 'Female' : 'Male'}
            </Text>
            <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="location" size={16} color="textBody" />
              <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
                {cand.city}, {cand.country}
              </Text>
            </View>
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
              <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.primarySecondary, justifyContent: 'center' }}>
                <Text variant="caption" weight={600} color="link">
                  {sphereChip(cand)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Panel gap={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyL" weight={700} accessibilityRole="header">
              Photos{' '}
              <Text variant="bodyL" weight={500} color="textBody">
                {media.photos}
              </Text>
            </Text>
            <Pressable onPress={() => openPhotos({ photos: p.gallery, index: 0 })} accessibilityRole="button" hitSlop={8}>
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                See all
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
            {tiles.map((src, i) => (
              <Pressable
                key={i}
                onPress={() => openPhotos({ photos: tiles, index: i })}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Photo ${i + 1} of ${media.photos}`}
                style={{ width: '33.333%', padding: 4 }}>
                <View style={{ height: 136, borderRadius: 16, overflow: 'hidden', backgroundColor: c.avatar4 }}>
                  <Image source={src} contentFit="cover" contentPosition={CROPS[i]?.pos ?? 'center'} style={{ width: '100%', height: '100%', transform: [{ scale: CROPS[i]?.scale ?? 1 }] }} />
                  {i === tiles.length - 1 && media.photos > tiles.length ? (
                    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,26,43,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="title" color="#FFFFFF" style={{ fontSize: 20 }}>
                        +{media.photos - tiles.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        </Panel>

        {cand.video && media.videos > 1 ? (
          <Panel
            title={`Videos ${media.videos}`}
            right={
              <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="view" size={14} color="successText" />
                <Text variant="caption" weight={700} color="successText">
                  {cand.video.views} views
                </Text>
              </View>
            }>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
              {VIDEO_TITLES.slice(0, media.videos).map((title, i) => (
                <Pressable
                  key={title}
                  onPress={() =>
                    openVideo({ poster: cand.photo, duration: i ? ['0:32', '0:28'][i - 1] : cand.video!.duration, label: title, name: p.fullName, tier: cand.tier, avatar: cand.photo, subtitle: `${cand.role} · ${cand.city}`, text: i ? undefined : p.about })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${title}`}
                  style={{ width: 140, gap: 6 }}>
                  <View style={{ height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: cand.tint }}>
                    <Image source={cand.photo} contentFit="cover" contentPosition={CROPS[i]?.pos ?? 'center'} style={{ width: '100%', height: '100%', transform: [{ scale: CROPS[i]?.scale ?? 1 }] }} />
                    <View style={{ position: 'absolute', left: 50, top: 80, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="play" size={18} color="#18191C" />
                    </View>
                    <View style={{ position: 'absolute', right: 8, bottom: 8, height: 22, paddingHorizontal: 7, borderRadius: 999, backgroundColor: 'rgba(24,25,27,0.7)', justifyContent: 'center' }}>
                      <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
                        {i ? ['0:32', '0:28'][i - 1] : cand.video!.duration}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyS" weight={600} numberOfLines={1} style={{ fontSize: 13 }}>
                    {title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Panel>
        ) : cand.video ? (
          <Panel
            title="Video presentation"
            right={
              <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="view" size={14} color="successText" />
                <Text variant="caption" weight={700} color="successText">
                  {cand.video.views} views
                </Text>
              </View>
            }>
            <Pressable
              onPress={() =>
                openVideo({
                  poster: cand.photo,
                  duration: cand.video!.duration,
                  label: 'Video presentation',
                  name: p.fullName,
                  tier: cand.tier,
                  avatar: cand.photo,
                  subtitle: `${cand.role} · ${cand.city}`,
                  text: p.about,
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Play video presentation"
              style={{ height: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: '#232426', alignItems: 'center' }}>
              <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 130, height: 200, backgroundColor: cand.tint }} />
              <View style={{ position: 'absolute', top: 74, width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={22} color="#18191C" />
              </View>
              <View style={{ position: 'absolute', right: 10, bottom: 10, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(24,25,27,0.7)', justifyContent: 'center' }}>
                <Text variant="caption" weight={600} color="#FFFFFF">
                  {cand.video.duration}
                </Text>
              </View>
            </Pressable>
          </Panel>
        ) : null}

        <Panel title="About" gap={8}>
          <Text variant="body" color="textPrimary" numberOfLines={more ? undefined : 4} style={{ fontSize: 15, lineHeight: 22 }}>
            {p.about}
          </Text>
          {p.about.length > 150 ? (
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

        <Panel
          title="Experience"
          list
          right={
            <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
              {p.total}
            </Text>
          }>
          {p.experience.map((j, i) => (
            <TimelineItem key={i} title={j.role} sub={j.place} meta={j.period} last={i === p.experience.length - 1} />
          ))}
        </Panel>

        {p.education ? (
          <Panel title="Education" list>
            <TimelineItem title={p.education.title} sub={p.education.school} meta={p.education.years} last />
          </Panel>
        ) : null}

        <Panel title={p.field.title}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {p.field.roles.map((r) => (
              <View key={r} style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.input, justifyContent: 'center' }}>
                <Text variant="bodyS" weight={600} style={{ fontSize: 13 }}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
          <View>
            {p.field.rows.map(([k, v], i) => (
              <View
                key={k}
                style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < p.field.rows.length - 1 ? 1 : 0, borderColor: c.divider }}>
                <Text variant="body" color="textBody" style={{ fontSize: 15 }}>
                  {k}
                </Text>
                <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </Panel>

        <Panel title="Portfolio and socials" list>
          {p.links.map((l, i) => (
            <Pressable
              key={l.kind}
              onPress={() => open(l.value, l.kind)}
              accessibilityRole="link"
              accessibilityLabel={`${l.label}: ${l.value}`}
              style={{ height: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < p.links.length - 1 ? 1 : 0, borderColor: c.divider }}>
              {l.kind === 'web' ? (
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="globe" size={18} color="primary" />
                </View>
              ) : (
                <CodeTile code={l.kind.toUpperCase()} size={36} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                  {l.label}
                </Text>
                <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                  {l.value}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="textBody" />
            </Pressable>
          ))}
        </Panel>
      </ScrollView>

      {/* pinned CTA (employer only) */}
      {seekerView ? null : (
      <View
        style={
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 14) + 6,
            backgroundColor: c.surfacePanel,
            backdropFilter: 'blur(12px)',
            borderTopWidth: 1,
            borderColor: c.divider,
          } as object
        }>
        <View style={{ width: '100%', maxWidth: 568, alignSelf: 'center' }}>
          <Button
            size="l"
            icon="message"
            label={chat ? (chat.request === 'pending' ? 'Request sent · Open chat' : 'Open chat') : 'Contact candidate'}
            variant={chat ? 'tonal' : 'primary'}
            onPress={contact}
          />
        </View>
      </View>
      )}

      {/* EmpContactSheet */}
      <BottomSheet visible={sheet === 'contact'} onClose={() => setSheet(null)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={cand.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" weight={700} numberOfLines={1} style={{ fontSize: 17 }}>
              Contact {first} directly
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
              {p.field.roles.join(' · ')} · {cand.city}
            </Text>
          </View>
          <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.labelOrangeBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star" size={12} color="labelOrangeText" />
            <Text variant="caption" weight={700} color="labelOrangeText">
              Premium
            </Text>
          </View>
        </View>
        <View style={{ minHeight: 120, borderRadius: 16, backgroundColor: c.input, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
          <Text variant="caption" weight={500} color="textBody">
            Message · optional
          </Text>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            multiline
            maxLength={500}
            placeholder={`Say what the job is about — it helps ${first} decide faster`}
            placeholderTextColor={c.textLightSecondary}
            style={{ marginTop: 4, minHeight: 72, fontSize: 16, lineHeight: 22, color: c.textHeadline, textAlignVertical: 'top', outlineStyle: 'none' } as object}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.primarySecondary }}>
          <Icon name="lock" size={18} color="textHeadline" />
          <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
            {first} gets a contact request. You can chat once {cand.gender === 'female' ? 'she' : 'he'} accepts it.
          </Text>
        </View>
        <Button size="l" label="Send request" onPress={send} />
      </BottomSheet>

      {/* EmpPaywallContact */}
      <PremiumSheet
        visible={sheet === 'paywall'}
        title={`Write to ${first} directly`}
        text="On the Free plan you can chat only with candidates who applied to your vacancy."
        onClose={() => setSheet(null)}
        onSubscribe={() => {
          setPlan('premium');
          toast({ text: 'Premium is active. Welcome!', kind: 'paid', icon: 'star' });
          setSheet('contact');
        }}
      />
    </View>
  );
}
