import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomSheet, Button, EmptyState, Icon, IconButton, Pressable, StatusChip, Text, useToast } from '@/components';
import { contractTypes, formatAmount } from '@/data/dictionaries';
import { initialsOf, useEmployer } from '@/data/employer';
import { asPublicVacancy, candidateOf } from '@/data/hiring';
import { useSoon } from '@/features/hire/ui';
import { Pager } from '@/features/media/Pager';
import { openPhotos } from '@/features/media/viewer';
import { DetailRow, Meta, Section } from '@/features/vacancies/detail';
import { ShareSheet } from '@/features/vacancies/ShareSheet';
import { PayLabel } from '@/features/vacancies/VacancyListCard';
import { useTheme } from '@/theme';

/** Employer's own vacancy (EmpVacancy / NoNew / Urgent / Changes / Rejected): the public page plus owner controls and moderation state. */
export default function MyVacancyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const soon = useSoon();
  const { vacancies, applicants, info, removeVacancy } = useEmployer();
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [sheet, setSheet] = useState<'share' | 'delete' | null>(null);
  const w = Math.min(width, 640);
  const v = vacancies.find((x) => x.id === id);
  const d = v?.detail;

  if (!v || !d) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton />
        <EmptyState icon="briefcase" title="Vacancy not found" text="It may have been deleted." passive />
      </View>
    );
  }

  const company = { name: info.name, initials: initialsOf(info.name) };
  const list = applicants[v.id] ?? [];
  const fresh = list.filter((x) => x.status === 'new');
  const live = v.status === 'active';
  const unpublished = v.status === 'changes' || v.status === 'rejected';
  const urgent = live && !!v.urgentLeft;
  const photos = d.photos.length ? d.photos : [v.cover];

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingBottom: live && fresh.length ? 120 : insets.bottom + 32, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ height: 300, backgroundColor: c.labelBlueBack }}>
          <Pager
            count={photos.length}
            width={w}
            height={300}
            index={page}
            onIndex={setPage}
            onTap={(i) => openPhotos({ photos, index: i })}
            renderItem={(i) => (
              <View pointerEvents="none">
                <Image source={photos[i]} contentFit="cover" style={{ width: w, height: 300 }} accessibilityLabel={`${v.title}, photo ${i + 1} of ${photos.length}`} />
              </View>
            )}
          />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 130, experimental_backgroundImage: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0))' }} />
          <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 12, flexDirection: 'row', gap: 8 }}>
            <BackButton tone="onPhoto" />
            <View style={{ flex: 1 }} />
            <IconButton tone="onPhoto" icon="share" label="Share" onPress={() => setSheet('share')} />
            <IconButton tone="onPhoto" icon="edit" label="Edit vacancy" onPress={() => soon('Vacancy editing')} />
            <IconButton tone="onPhoto" icon="trash" color={c.dangerText} label="Delete vacancy" onPress={() => setSheet('delete')} />
          </View>
          <View style={{ position: 'absolute', right: 16, bottom: 52, height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.mediaOverlay, justifyContent: 'center' }}>
            <Text variant="caption" weight={600} color="#FFFFFF">
              {page + 1} / {photos.length}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: -36, paddingHorizontal: 16, gap: 12 }}>
          {/* Header */}
          <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.textHeadline, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="displayM" color="surface" style={{ fontSize: 11, lineHeight: 14 }}>
                  {company.initials}
                </Text>
              </View>
              <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>
                {company.name}
              </Text>
              <Icon name="verified" size={16} color="primary" />
              <View style={{ flex: 1 }} />
              <StatusChip kind="new" label={d.category} icon={null} />
            </View>
            {urgent ? (
              <View style={{ flexDirection: 'row' }}>
                <StatusChip kind="urgent" label="Urgent" />
              </View>
            ) : v.status === 'changes' ? (
              <View style={{ flexDirection: 'row' }}>
                <StatusChip kind="attention" label="Changes needed" />
              </View>
            ) : v.status === 'rejected' ? (
              <View style={{ flexDirection: 'row' }}>
                <StatusChip kind="danger" label="Rejected" icon="alert-circle" />
              </View>
            ) : v.status === 'review' ? (
              <View style={{ flexDirection: 'row' }}>
                <StatusChip kind="pending" label="On review" />
              </View>
            ) : v.status === 'archive' ? (
              <View style={{ flexDirection: 'row' }}>
                <StatusChip kind="closed" label="In archive" />
              </View>
            ) : null}
            <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 27 }}>
              {v.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="displayL" style={{ fontSize: 24, lineHeight: 30 }}>
                {d.amount != null ? `${d.from ? 'from ' : ''}${d.currency} ${formatAmount(d.amount)}` : 'Negotiable'}
              </Text>
              {d.amount != null ? (
                <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
                  {contractTypes[d.contract].suffix}
                </Text>
              ) : null}
              <View style={{ flex: 1 }} />
              <PayLabel contract={d.contract} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
              <Meta icon="location" text={`${d.city}, UAE`} flex />
              {unpublished || v.status === 'review' ? (
                <Meta icon="clock" text={v.status === 'review' ? 'On review' : 'Not published'} />
              ) : (
                <>
                  <Meta icon="clock" text={d.posted} />
                  <Meta icon="view" text={formatAmount(d.views)} />
                </>
              )}
            </View>
          </View>

          {/* Owner state */}
          {live && !urgent ? (
            <Pressable
              onPress={() => soon('Urgent hiring')}
              accessibilityRole="button"
              accessibilityLabel="Make it urgent for $2.99"
              style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="fire" size={22} color="onUrgent" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  Need people fast?
                </Text>
                <Text variant="bodyS" color="textBody" style={{ fontSize: 13, lineHeight: 18 }}>
                  Make it urgent: top of the feed and a hot badge for 24 h
                </Text>
              </View>
              <View style={{ height: 36, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.inverse, justifyContent: 'center' }}>
                <Text variant="body" weight={700} color="onInverse" style={{ fontSize: 14 }}>
                  $2.99
                </Text>
              </View>
            </Pressable>
          ) : null}

          {urgent && v.urgentInfo ? (
            <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="fire" size={22} color="onUrgent" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                    Urgent hiring is on
                  </Text>
                  <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                    {v.urgentInfo.left}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${Math.round(v.urgentInfo.progress * 100)}% of the 24 hours left`}>
                {Array.from({ length: 24 }, (_, i) => (
                  <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: i < Math.round(v.urgentInfo!.progress * 24) ? c.urgent : c.backDarker }} />
                ))}
              </View>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  +{formatAmount(v.urgentInfo.views)}
                </Text>
                {' views    '}
                <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                  +{v.urgentInfo.applicants}
                </Text>
                {' applicants since it went urgent'}
              </Text>
            </View>
          ) : null}

          {v.status === 'changes' && v.changes ? (
            <View style={{ backgroundColor: c.attentionBack, borderRadius: 24, padding: 18, gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="edit" size={22} color="onUrgent" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                    Changes needed
                  </Text>
                  <Text variant="bodyS" color="attentionText" style={{ fontSize: 13, lineHeight: 18 }}>
                    The 919 team reviewed your vacancy · {v.changes.at}
                  </Text>
                </View>
              </View>
              <View>
                {v.changes.items.map((t, i) => (
                  <View key={t} style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: 'rgba(24,25,28,0.08)' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="caption" weight={700} color="onUrgent" style={{ fontSize: 12 }}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
              <Button size="l" icon="edit" label="Edit and resubmit" onPress={() => soon('Vacancy editing')} />
              <Text variant="caption" weight={400} color="attentionText" align="center" style={{ fontSize: 12, lineHeight: 17 }}>
                After you save, the vacancy goes back to review. Paid Urgent hiring starts only after approval.
              </Text>
            </View>
          ) : null}

          {v.status === 'rejected' && v.rejected ? (
            <View style={{ backgroundColor: c.dangerBack, borderRadius: 24, padding: 18, gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.dangerText, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="alert-circle" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                    Vacancy rejected
                  </Text>
                  <Text variant="bodyS" color="dangerText" style={{ fontSize: 13 }}>
                    Violates 919 rules · can’t be published
                  </Text>
                </View>
              </View>
              <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 14, gap: 6 }}>
                <Text variant="caption" weight={700} color="textBody" style={{ fontSize: 11, letterSpacing: 0.8 }}>
                  REASON
                </Text>
                <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
                  {v.rejected.reason}
                </Text>
              </View>
              {v.rejected.refund ? (
                <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="fire" size={14} color="onUrgent" />
                  </View>
                  <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
                    <Text variant="bodyS" weight={700} style={{ fontSize: 13 }}>
                      Urgent hiring $2.99 will be refunded
                    </Text>
                    {' to your Apple ID within 3 business days.'}
                  </Text>
                </View>
              ) : null}
              <Pressable
                onPress={() => soon('Chat with 919 support')}
                accessibilityRole="button"
                style={{ height: 52, borderRadius: 16, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="message" size={20} color="textHeadline" />
                <Text variant="bodyL" weight={700} style={{ fontSize: 15 }}>
                  Contact 919 support
                </Text>
              </Pressable>
              <Text variant="caption" weight={400} color="dangerText" align="center" style={{ fontSize: 12 }}>
                Repeated violations block the company account.
              </Text>
            </View>
          ) : null}

          {v.status === 'review' ? (
            <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, flexDirection: 'row', gap: 12 }}>
              <Icon name="clock" size={22} color="textBody" />
              <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
                The 919 team checks every vacancy, usually within an hour. Applicants will appear after publication.
              </Text>
            </View>
          ) : null}

          <Section title="Vacancy details">
            <View>
              <DetailRow label="Role" value={d.role} />
              <DetailRow label="Gender" value={d.gender} />
              <DetailRow label="Age" value={d.age} />
              <DetailRow label="Location" value={`${d.city}, ${d.country}`} last />
            </View>
          </Section>

          <Section title="Job description">
            <Text variant="body" color="textPrimary" numberOfLines={more ? undefined : 5} style={{ lineHeight: 22 }}>
              {d.description}
            </Text>
            <Pressable onPress={() => setMore(!more)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
              <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                {more ? 'Show less' : 'Show more'}
              </Text>
              <Icon name="chevron-down" size={16} color="link" />
            </Pressable>
          </Section>

          {d.requirements.length ? (
            <Section title="Requirements">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {d.requirements.map((r) => (
                  <View key={r} style={{ height: 34, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center', backgroundColor: c.input }}>
                    <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                      {r}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section
            title="Photos"
            action={
              <Pressable onPress={() => openPhotos({ photos, index: 0 })} accessibilityRole="button" hitSlop={8}>
                <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                  See all {photos.length}
                </Text>
              </Pressable>
            }>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {photos.slice(0, 3).map((ph, i) => (
                <Pressable
                  key={i}
                  onPress={() => openPhotos({ photos, index: i })}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Open photo ${i + 1} of ${photos.length}`}
                  style={{ flex: 1, height: 96, borderRadius: 14, overflow: 'hidden', backgroundColor: c.backDarker }}>
                  <Image source={ph} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Posted by">
            <Pressable onPress={() => router.push('/company/profile')} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.textHeadline, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="displayM" color="surface" style={{ fontSize: 13 }}>
                  {company.initials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="bodyL">{company.name}</Text>
                  <Icon name="verified" size={16} color="primary" />
                </View>
                <Meta icon="location" text={`${info.city}, ${info.country}`} />
              </View>
              <Icon name="chevron-right" size={18} color="textBody" />
            </Pressable>
          </Section>
        </View>
      </ScrollView>

      {/* New applicants: floating pill (EmpVacancy). Hidden when nobody new (EmpVacancyNoNew). */}
      {live && fresh.length ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16) + 8, alignItems: 'center' }}>
          <Pressable
            onPress={() => router.navigate({ pathname: '/hire/applicants', params: { id: v.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${fresh.length} new applicants`}
            style={{
              height: 56,
              paddingLeft: 12,
              paddingRight: 20,
              borderRadius: 999,
              backgroundColor: c.primary,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 24px rgba(53,137,242,0.35)',
            }}>
            <View style={{ flexDirection: 'row' }}>
              {fresh.slice(0, 3).map((x, i) => (
                <Image
                  key={x.candidateId}
                  source={candidateOf(x).photo}
                  contentFit="cover"
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: c.primary, marginLeft: i ? -8 : 0, backgroundColor: c.backDarker }}
                />
              ))}
            </View>
            <Text variant="bodyL" weight={700} color="ctaButtonText" style={{ fontSize: 16 }}>
              {fresh.length} new applicant{fresh.length === 1 ? '' : 's'}
            </Text>
            <Icon name="arrow-right" size={18} color="ctaButtonText" />
          </Pressable>
        </View>
      ) : null}

      <ShareSheet v={asPublicVacancy(v, d, company)} visible={sheet === 'share'} onClose={() => setSheet(null)} />
      <BottomSheet visible={sheet === 'delete'} onClose={() => setSheet(null)}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash" size={28} color="dangerText" />
          </View>
          <Text variant="title" align="center">
            Delete this vacancy?
          </Text>
          <Text variant="body" color="textBody" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
            “{v.title}” disappears from the feed and search{list.length ? `, and its ${list.length} applicants get a notice that it’s closed` : ''}. This can’t be undone.
          </Text>
        </View>
        <Button
          size="l"
          variant="danger"
          label="Delete vacancy"
          onPress={() => {
            setSheet(null);
            router.back();
            removeVacancy(v.id);
            toast({ text: 'Vacancy deleted', kind: 'neutral', icon: 'trash' });
          }}
        />
        <Pressable onPress={() => setSheet(null)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 8 }}>
          <Text variant="body" weight={700} color="textBody">
            Cancel
          </Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}
