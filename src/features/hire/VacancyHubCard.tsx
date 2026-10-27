import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, Pressable, Text } from '@/components';
import { useEmployer, type MyVacancy } from '@/data/employer';
import { findCandidate } from '@/data/talentPool';
import { useTheme } from '@/theme';

import { HireAskRow } from './HireSurveySheet';
import { Pill } from './ui';

export function Faces({ faces }: { faces: MyVacancy['faces'] }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {(faces ?? []).map((f, i) => (
        <Image
          key={i}
          source={f}
          contentFit="cover"
          contentPosition={{ top: '25%' }}
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: c.surface, marginLeft: i ? -10 : 0, backgroundColor: c.backDarker }}
        />
      ))}
    </View>
  );
}

/** Vacancy card in the hub (EmpHiring / EmpHiringModeration): status, days bar for active, moderation result, applicants, relaunch for archive. */
export function VacancyCard({ v, onActions }: { v: MyVacancy; onActions: (sheet?: 'menu' | 'relaunch') => void }) {
  const { c } = useTheme();
  const { applicants } = useEmployer();
  const archived = v.status === 'archive';
  const list = applicants[v.id] ?? [];
  const fresh = list.filter((x) => x.status === 'new');
  const faces = (fresh.length ? fresh : list).slice(0, 3).map((x) => findCandidate(x.candidateId)!.photo);
  const open = () => router.push({ pathname: '/my-vacancy/[id]', params: { id: v.id } });
  const openApplicants = () => router.push({ pathname: '/hire/applicants', params: { id: v.id } });
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={v.title}
          style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={v.cover} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.backDarker, opacity: archived ? 0.6 : 1 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" weight={600} numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
              {v.title}
            </Text>
            <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 3, fontSize: 13 }}>
              {v.meta}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => onActions()}
          accessibilityRole="button"
          accessibilityLabel="Vacancy actions"
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="more" size={20} color="textHeadline" />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {v.status === 'active' ? (
          <Pill label="Active" bg={c.successBack} fg={c.successText} h={26} />
        ) : v.status === 'review' ? (
          <Pill label="On review" icon="clock" bg={c.input} fg={c.textBody} h={26} />
        ) : v.status === 'changes' ? (
          <Pill label="Changes needed" icon="edit" bg={c.attentionBack} fg={c.attentionText} h={26} />
        ) : v.status === 'rejected' ? (
          <Pill label="Rejected" icon="alert-circle" bg={c.dangerBack} fg={c.dangerText} h={26} />
        ) : (
          <Pill label="In archive" bg={c.input} fg={c.textBody} h={26} />
        )}
        {v.urgentLeft && v.status === 'active' ? <Pill label={v.urgentLeft} icon="fire" bg={c.urgent} fg={c.onUrgent} h={26} /> : null}
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
          {v.note}
        </Text>
      </View>

      {v.status === 'active' && v.daysLeft != null ? (
        <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${v.daysLeft} of 7 days left`}>
          {Array.from({ length: 7 }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: i < v.daysLeft! ? c.primary : c.backDarker }} />
          ))}
        </View>
      ) : null}

      {v.status === 'changes' && v.changes ? (
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: c.attentionBack, gap: 10 }}>
          <Text variant="bodyS" color="textHeadline" style={{ fontSize: 14, lineHeight: 20 }}>
            <Text variant="bodyS" weight={700} style={{ fontSize: 14 }}>
              {`${v.changes.items.length} corrections from the 919 team: `}
            </Text>
            {v.changes.summary}
          </Text>
          <Pressable
            onPress={() => router.push({ pathname: '/post/edit', params: { id: v.id } })}
            accessibilityRole="button"
            style={{ alignSelf: 'flex-start', height: 36, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.primary, justifyContent: 'center' }}>
            <Text variant="body" weight={700} color="ctaButtonText" style={{ fontSize: 14 }}>
              Fix and resubmit
            </Text>
          </Pressable>
        </View>
      ) : v.status === 'rejected' && v.rejected ? (
        <Pressable onPress={open} accessibilityRole="button" style={{ padding: 14, borderRadius: 16, backgroundColor: c.dangerBack, gap: 8 }}>
          <Text variant="bodyS" color="textHeadline" style={{ fontSize: 14, lineHeight: 20 }}>
            <Text variant="bodyS" weight={700} style={{ fontSize: 14 }}>
              {'Violates 919 rules: '}
            </Text>
            {v.rejected.short}
          </Text>
          {v.rejected.refund ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="fire" size={12} color="onUrgent" />
              </View>
              <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13 }}>
                Urgent $2.99 refund within 3 business days
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : v.status === 'review' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
          <Icon name="clock" size={18} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
            Moderation usually takes up to 2 hours. Applicants will appear here after publication.
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={openApplicants}
          accessibilityRole="button"
          accessibilityLabel={`${list.length} applicants${fresh.length ? `, ${fresh.length} new` : ''}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: c.divider }}>
          {faces.length ? <Faces faces={faces} /> : null}
          <Text variant="body" weight={600} style={{ flex: 1, fontSize: 14 }}>
            {list.length ? `${list.length} applicant${list.length === 1 ? '' : 's'}` : 'No applicants yet'}
          </Text>
          {fresh.length && !archived ? <Pill label={`${fresh.length} new`} bg={c.primary} fg={c.ctaButtonText} h={24} /> : null}
          <Icon name="chevron-right" size={18} color="textLightSecondary" />
        </Pressable>
      )}

      {v.status === 'active' || archived ? <HireAskRow vacancyId={v.id} /> : null}

      {archived ? (
        <Pressable
          onPress={() => onActions('relaunch')}
          accessibilityRole="button"
          style={{ height: 44, borderRadius: 14, backgroundColor: c.primarySecondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="flash" size={18} color="link" />
          <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
            Relaunch for 7 days
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
