import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, PatternHeader, Pressable, SegmentedTabs, TAB_BAR_SPACE, Text, useToast } from '@/components';
import { company, me, myVacancies, team, useEmployer } from '@/data/employer';
import { useSession } from '@/data/session';
import { GlassButton, Pill, Round, Section, useSoon } from '@/features/hire/ui';
import { useTheme } from '@/theme';

type Tab = 'recruiters' | 'company' | 'vacancies';

function Recruiters() {
  const { c } = useTheme();
  const toast = useToast();
  const { joinRequests, resolveJoin } = useEmployer();
  return (
    <>
      {joinRequests.length ? (
        <Section>
          <Text variant="body" weight={700} style={{ fontSize: 16 }}>
            Join requests{' '}
            <Text variant="body" weight={500} color="textBody" style={{ fontSize: 16 }}>
              · {joinRequests.length}
            </Text>
          </Text>
          {joinRequests.map((j) => (
            <View key={j.id} style={{ marginTop: 4, marginBottom: 8, padding: 14, borderRadius: 18, backgroundColor: c.input, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Round source={j.photo} size={44} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                    {j.name}
                  </Text>
                  <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
                    Recruiter · {j.email}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="clock" size={16} color="textBody" />
                <Text variant="bodyS" color="textPrimary" style={{ fontSize: 13 }}>
                  Wants to join the company · {j.when}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button variant="secondary" label="Decline" onPress={() => (resolveJoin(j.id), toast({ text: 'Request declined', icon: 'cancel', aboveTabBar: true }))} style={{ flex: 1 }} />
                <Button label="Accept" onPress={() => (resolveJoin(j.id), toast({ text: `${j.name.split(' ')[0]} joined the team`, icon: 'check', aboveTabBar: true }))} style={{ flex: 1 }} />
              </View>
            </View>
          ))}
        </Section>
      ) : null}
      <Section style={{ paddingTop: 6, gap: 8 }}>
        <Text variant="body" weight={700} style={{ fontSize: 16, marginTop: 12 }}>
          Team{' '}
          <Text variant="body" weight={500} color="textBody" style={{ fontSize: 16 }}>
            · {team.length}
          </Text>
        </Text>
        <View>
          {team.map((m, i) => (
            <View key={m.id} style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < team.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <Round source={m.photo} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                  {m.name}
                  {m.you ? (
                    <Text variant="body" weight={500} color="textBody" style={{ fontSize: 15 }}>
                      {' '}
                      · You
                    </Text>
                  ) : null}
                </Text>
                <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
                  {m.role}
                </Text>
              </View>
              {m.admin ? <Pill label="Admin" bg={c.primarySecondary} fg={c.link} h={24} /> : null}
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function LinkRow({ badge, icon, label, value, last, onPress }: { badge?: string | null; icon?: 'globe' | 'call' | 'mail' | 'location'; label: string; value: string; last: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
        {badge ? (
          <Text variant="caption" weight={700} color="link" style={{ fontSize: 11, letterSpacing: 0.4 }}>
            {badge}
          </Text>
        ) : (
          <Icon name={icon ?? 'globe'} size={20} color="link" />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
          {label}
        </Text>
        <Text variant="body" weight={600} numberOfLines={1} style={{ marginTop: 2, fontSize: 15 }}>
          {value}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color="textLightSecondary" />
    </Pressable>
  );
}

function About() {
  const soon = useSoon();
  return (
    <>
      <Section>
        <Text variant="body" weight={700} style={{ fontSize: 16 }}>
          About the company
        </Text>
        <Text variant="body" color="textPrimary" style={{ fontSize: 15, lineHeight: 23 }}>
          {company.about}
        </Text>
      </Section>
      <Section style={{ gap: 4 }}>
        <Text variant="body" weight={700} style={{ fontSize: 16, marginBottom: 4 }}>
          Website and social
        </Text>
        {company.links.map((l, i) => (
          <LinkRow key={l.key} badge={l.badge} icon="globe" label={l.label} value={l.value} last={i === company.links.length - 1} onPress={() => soon(l.label)} />
        ))}
      </Section>
      <Section style={{ gap: 4 }}>
        <Text variant="body" weight={700} style={{ fontSize: 16, marginBottom: 4 }}>
          Contacts
        </Text>
        {company.contacts.map((l, i) => (
          <LinkRow key={l.key} icon={l.icon} label={l.label} value={l.value} last={i === company.contacts.length - 1} onPress={() => soon(l.label)} />
        ))}
      </Section>
    </>
  );
}

function Vacancies() {
  const { c } = useTheme();
  const soon = useSoon();
  const list = myVacancies.filter((v) => v.status !== 'archive');
  return (
    <View style={{ gap: 10 }}>
      {list.map((v) => (
        <Pressable key={v.id} onPress={() => soon('Vacancy page')} accessibilityRole="button" accessibilityLabel={v.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, borderRadius: 20, padding: 12 }}>
          <Image source={v.cover} contentFit="cover" style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
              {v.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {v.status === 'active' ? <Pill label="Active" bg={c.successBack} fg={c.successText} /> : <Pill label="On review" bg={c.input} fg={c.textBody} />}
              {v.status === 'active' ? (
                <>
                  <Icon name="view" size={14} color="textBody" />
                  <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
                    {v.views} views
                  </Text>
                </>
              ) : (
                <Text variant="caption" weight={400} color="textBody" style={{ fontSize: 12 }}>
                  {v.note}
                </Text>
              )}
            </View>
          </View>
          {v.fresh ? <Pill label={`+${v.fresh} new`} bg={c.primary} fg={c.ctaButtonText} h={24} /> : null}
        </Pressable>
      ))}
      <Pressable onPress={() => router.push('/post/category')} accessibilityRole="button" style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 }}>
        <Icon name="add" size={18} color="link" />
        <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
          Post a new vacancy
        </Text>
      </Pressable>
    </View>
  );
}

/** Employer — Company (CompanyRecruiters / CompanyAbout / CompanyPremium): greeting, company card, three tabs. */
export default function HireCompany() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const soon = useSoon();
  const { user } = useSession();
  const [tab, setTab] = useState<Tab>('recruiters');
  const pending = user?.company?.status === 'pending';
  const name = user?.company?.name ?? company.name;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.back }} contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 16 }}>
      <PatternHeader style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={me.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="body" color="rgba(255,255,255,0.9)" style={{ fontSize: 14 }}>
              Hello,
            </Text>
            <Text variant="displayM" color="#FFFFFF" numberOfLines={1} style={{ fontSize: 22, lineHeight: 26 }}>
              {user?.firstName ?? me.firstName}
            </Text>
          </View>
          <GlassButton icon="edit" label="Edit company profile" onPress={() => soon('Edit profile')} />
          <GlassButton icon="settings" label="Settings" onPress={() => router.push('/profile/settings')} />
        </View>
        <Pressable
          onPress={() => setTab('company')}
          accessibilityRole="button"
          accessibilityLabel={`Company profile: ${name}`}
          style={[{ height: 52, paddingLeft: 8, paddingRight: 10, borderRadius: 16, backgroundColor: c.onMediaPill, flexDirection: 'row', alignItems: 'center', gap: 10 }, { backdropFilter: 'blur(8px)' } as object]}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#18191C', alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="caption" weight={600} color="#FFFFFF" style={{ fontSize: 11 }}>
              {company.initials}
            </Text>
          </View>
          <Text variant="body" weight={700} color="#FFFFFF" numberOfLines={1} style={{ flex: 1, fontSize: 15 }}>
            {name}
          </Text>
          {pending ? (
            <Pill label="Under review" icon="clock" bg={c.surface} fg={c.textBody} h={26} />
          ) : company.plan === 'premium' ? (
            <Pill label="Premium" icon="star" bg={c.labelOrangeBack} fg={c.labelOrangeText} h={26} />
          ) : (
            <Pill label="Verified" icon="verified" bg={c.successBack} fg={c.successText} h={26} />
          )}
        </Pressable>
      </PatternHeader>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <SegmentedTabs<Tab>
          items={[
            { key: 'recruiters', label: 'Recruiters' },
            { key: 'company', label: 'Company' },
            { key: 'vacancies', label: 'Vacancies' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'recruiters' ? <Recruiters /> : tab === 'company' ? <About /> : <Vacancies />}
      </View>
    </ScrollView>
  );
}
