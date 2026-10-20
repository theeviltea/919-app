import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomSheet, Button, EmptyState, Icon, IconButton, Pressable, StatusChip, Text, useToast } from '@/components';
import { contractTypes, formatAmount, spheres } from '@/data/dictionaries';
import { findVacancy } from '@/data/mock';
import { matchRequirement, useSeeker } from '@/data/seeker';
import { useSession } from '@/data/session';
import { GuestAuthSheet } from '@/features/talent/GuestAuth';
import { Pager } from '@/features/media/Pager';
import { openPhotos } from '@/features/media/viewer';
import { ShareSheet } from '@/features/vacancies/ShareSheet';
import { useApply } from '@/features/vacancies/useApply';
import { PayLabel } from '@/features/vacancies/VacancyListCard';
import { DetailRow, Meta, Section } from '@/features/vacancies/detail';
import { useTheme } from '@/theme';

/** Vacancy page. Public for guests: Respond and Save open the sign-in sheet (role: job seeker). */
export default function VacancyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const v = findVacancy(id);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useSession();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [share, setShare] = useState(false);
  const [auth, setAuth] = useState(false);
  const [sheet, setSheet] = useState<'more' | null>(null);
  const seeker = useSeeker();
  const apply = useApply({ aboveTabBar: true });
  const w = Math.min(width, 640);

  if (!v) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton />
        <EmptyState icon="briefcase" title="Vacancy not found" text="It may have been closed or moved to the archive." passive />
      </View>
    );
  }

  const guest = !user;
  const p = seeker.profile;
  const app = guest ? undefined : seeker.appFor(v.id);
  const saved = !guest && seeker.saved.includes(v.id);
  const fits = v.requirements.map((r) => ({ r, ok: !guest && matchRequirement(r, p) }));
  const fitN = fits.filter((f) => f.ok).length;
  const firstGap = fits.find((f) => !f.ok)?.r;

  const respond = () => {
    if (guest) return setAuth(true);
    apply.respond(v.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ height: 300, backgroundColor: c.labelBlueBack }}>
          <Pager
            count={v.photos.length}
            width={w}
            height={300}
            index={page}
            onIndex={setPage}
            onTap={(i) => openPhotos({ photos: v.photos, index: i })}
            renderItem={(i) => (
              // pointerEvents none: on web a dragged <img> starts a native image drag and swallows the swipe.
              <View pointerEvents="none">
                <Image source={v.photos[i]} contentFit="cover" style={{ width: w, height: 300 }} accessibilityLabel={`${v.title}, photo ${i + 1} of ${v.photos.length}`} />
              </View>
            )}
          />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 130, experimental_backgroundImage: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0))' }} />
          <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 12, flexDirection: 'row', gap: 8 }}>
            <BackButton tone="onPhoto" />
            <View style={{ flex: 1 }} />
            <IconButton tone="onPhoto" icon="share" label="Share" onPress={() => setShare(true)} />
            <IconButton
              tone="onPhoto"
              icon={saved ? 'bookmark-filled' : 'bookmark'}
              color={saved ? c.primary : undefined}
              label={saved ? 'Remove from saved' : 'Save vacancy'}
              onPress={() => {
                if (guest) return setAuth(true);
                const on = seeker.toggleSaved(v.id);
                toast({ text: on ? 'Saved to your vacancies' : 'Removed from saved', kind: 'neutral', icon: 'bookmark' });
              }}
            />
            {guest ? null : <IconButton tone="onPhoto" icon="more" label="More" onPress={() => setSheet('more')} />}
          </View>
          <View style={{ position: 'absolute', right: 16, bottom: 52, height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.mediaOverlay, justifyContent: 'center' }}>
            <Text variant="caption" weight={600} color="#FFFFFF">
              {page + 1} / {v.photos.length}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: -36, paddingHorizontal: 16, gap: 12 }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.textHeadline, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="displayM" color="surface" style={{ fontSize: 11, lineHeight: 14 }}>
                  {v.company.initials}
                </Text>
              </View>
              <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                {v.company.name}
              </Text>
              {v.company.verified ? <Icon name="verified" size={16} color="primary" /> : null}
              <View style={{ flex: 1 }} />
              <StatusChip kind="new" label={spheres[v.sphere]} icon={null} />
            </View>
            {v.urgent ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StatusChip kind="urgent" label="Urgent" />
                <Text variant="bodyS" color="textBody">
                  Hiring within 24 h
                </Text>
              </View>
            ) : null}
            <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 27 }}>
              {v.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="displayL" style={{ fontSize: 24, lineHeight: 30 }}>
                {v.pay.currency} {formatAmount(v.pay.amount)}
              </Text>
              <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
                {contractTypes[v.pay.contract].suffix}
              </Text>
              <View style={{ flex: 1 }} />
              <PayLabel contract={v.pay.contract} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
              <Meta icon="location" text={`${v.city}, UAE`} flex />
              <Meta icon="clock" text={v.postedAgo} />
              <Meta icon="view" text={formatAmount(v.views)} />
            </View>
          </View>

          {!guest && v.requirements.length ? (
            <View style={{ backgroundColor: c.primarySecondary, borderRadius: 24, padding: 18, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="sparkles" size={18} color="link" />
                <Text variant="body" weight={700}>
                  {fitN === fits.length ? 'You fit all requirements' : `You fit ${fitN} of ${fits.length} requirements`}
                </Text>
              </View>
              {firstGap ? (
                <>
                  <Text variant="bodyS" color="textPrimary">
                    {/video/i.test(firstGap) ? 'Add a video presentation — this employer asks for one before the first call.' : `Missing: ${firstGap}. You can still apply.`}
                  </Text>
                  {/video/i.test(firstGap) ? (
                    <Pressable onPress={() => router.push('/profile/general')} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                        Add video
                      </Text>
                      <Icon name="chevron-right" size={14} color="link" />
                    </Pressable>
                  ) : null}
                </>
              ) : (
                <Text variant="bodyS" color="textPrimary">
                  Your profile matches what the employer asks for.
                </Text>
              )}
            </View>
          ) : null}

          <Section title="Vacancy details">
            <View>
              <DetailRow label="Role" value={v.details.role} />
              {v.details.gender ? <DetailRow label="Gender" value={v.details.gender} /> : null}
              {v.details.age ? <DetailRow label="Age" value={v.details.age} /> : null}
              <DetailRow label="Location" value={`${v.city}, ${v.country}`} last />
            </View>
          </Section>

          <Section title="Job description">
            <Text variant="body" color="textPrimary" numberOfLines={more ? undefined : 5} style={{ lineHeight: 22 }}>
              {v.description}
            </Text>
            <Pressable onPress={() => setMore(!more)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                {more ? 'Show less' : 'Show more'}
              </Text>
              <Icon name="chevron-down" size={16} color="link" />
            </Pressable>
          </Section>

          <Section title="Requirements">
            {/* Guests can't be matched against a profile: neutral chips, no checkmarks. */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {fits.map(({ r, ok }) => (
                <View
                  key={r}
                  style={{
                    height: 34,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: guest ? c.input : ok ? c.successBack : c.infoBack,
                  }}>
                  {guest ? null : <Icon name={ok ? 'check' : 'alert-circle'} size={14} color={ok ? 'successText' : 'infoText'} />}
                  <Text variant="body" weight={600} color={guest ? 'textHeadline' : ok ? 'successText' : 'infoText'} style={{ fontSize: 14 }}>
                    {r}
                  </Text>
                </View>
              ))}
            </View>
            {guest ? null : (
              <Text variant="bodyS" color="textBody">
                Green — already in your profile.
              </Text>
            )}
          </Section>

          <Section
            title="Photos"
            action={
              <Pressable onPress={() => openPhotos({ photos: v.photos, index: 0 })} accessibilityRole="button" hitSlop={8}>
                <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                  See all {v.photos.length}
                </Text>
              </Pressable>
            }>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {v.photos.slice(0, 3).map((ph, i) => (
                <Pressable
                  key={i}
                  onPress={() => openPhotos({ photos: v.photos, index: i })}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Open photo ${i + 1} of ${v.photos.length}`}
                  style={{ flex: 1, height: 96, borderRadius: 14, overflow: 'hidden', backgroundColor: c.backDarker }}>
                  <Image source={ph} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                  {i === 2 && v.photos.length > 3 ? (
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14,26,43,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="bodyL" weight={700} color="#FFFFFF">
                        +{v.photos.length - 3}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Posted by">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.textHeadline, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="displayM" color="surface" style={{ fontSize: 13 }}>
                  {v.company.initials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="bodyL">{v.company.name}</Text>
                  {v.company.verified ? <Icon name="verified" size={16} color="primary" /> : null}
                </View>
                <Meta icon="location" text={`${v.city}, ${v.country}`} />
              </View>
              <Icon name="chevron-right" size={18} color="textBody" />
            </View>
          </Section>
        </View>
      </ScrollView>

      <View
        style={
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: 14,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 14) + 6,
            backgroundColor: c.surfacePanel,
            borderTopWidth: 1,
            borderColor: c.divider,
            backdropFilter: 'blur(12px)',
          } as object
        }>
        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
          {!app ? (
            <Button size="l" label="Respond" onPress={respond} />
          ) : app.status === 'pending' ? (
            <View accessibilityRole="text" style={{ height: 56, borderRadius: 18, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="clock" size={20} color="textBody" />
              <Text variant="bodyL" weight={700} color="textBody" style={{ fontSize: 17 }}>
                Pending approval
              </Text>
            </View>
          ) : app.status === 'declined' || app.status === 'closed' ? (
            <Button size="l" variant="neutral" label={app.status === 'declined' ? 'Application declined' : 'Vacancy closed'} disabled />
          ) : (
            <Button
              size="l"
              icon="message"
              label={app.status === 'hired' ? 'You’re hired · Open chat' : 'Accepted · Open chat'}
              onPress={() => app.chatId && router.push({ pathname: '/chat/[id]', params: { id: app.chatId } })}
            />
          )}
        </View>
      </View>

      {guest ? null : (
        <>
          {apply.sheets}
          <BottomSheet visible={sheet === 'more'} onClose={() => setSheet(null)}>
            <Button
              variant="danger"
              icon="alert-circle"
              label="Report vacancy"
              onPress={() => (setSheet(null), toast({ text: 'Thanks. The 919 team will check this vacancy', kind: 'neutral', icon: 'alert-circle' }))}
            />
          </BottomSheet>
        </>
      )}

      <ShareSheet v={v} visible={share} onClose={() => setShare(false)} />
      <GuestAuthSheet
        visible={auth}
        onClose={() => setAuth(false)}
        role="seeker"
        title="Sign in to apply"
        subtitle="Your application goes out right after you sign in."
        context={{ title: v.title, subtitle: `${v.company.name} · ${v.pay.currency} ${formatAmount(v.pay.amount)} ${contractTypes[v.pay.contract].suffix}`, image: v.cover }}
        returnTo={`/vacancy/${v.id}`}
      />
    </View>
  );
}
