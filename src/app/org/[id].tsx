import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, EmptyState, Icon, IconButton, PatternHeader, Pressable, SegmentedTabs, Text, useToast, type IconName } from '@/components';
import { companyProfile, companyVacancies } from '@/data/companies';
import { useSeeker } from '@/data/seeker';
import { useSession } from '@/data/session';
import { SaveButton } from '@/features/vacancies/SaveButton';
import { VacancyListCard } from '@/features/vacancies/VacancyListCard';
import { useTheme } from '@/theme';

type Tab = 'about' | 'vacancies';

/** Employer page as job seekers see it (SeekCompanyAbout / SeekCompanyVacancies): about, links and active vacancies. Public for guests. */
export default function CompanyPage() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useSession();
  const { appFor } = useSeeker();
  const [tab, setTab] = useState<Tab>(tabParam === 'vacancies' ? 'vacancies' : 'about');
  const co = companyProfile(id);
  const back = () => (router.canGoBack() ? router.back() : router.navigate('/'));

  if (!co) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton onPress={back} />
        <EmptyState icon="building" title="Company not found" text="It may have left 919." passive />
      </View>
    );
  }

  const list = companyVacancies(co.id);
  const seeker = user?.role === 'seeker';
  const links: { key: string; icon?: IconName; badge?: string; label: string; value: string; url: string }[] = [
    ...(co.website ? [{ key: 'web', icon: 'globe' as const, label: 'Website', value: co.website, url: `https://${co.website}` }] : []),
    ...(co.instagram ? [{ key: 'ig', badge: 'IG', label: 'Instagram', value: co.instagram, url: `https://instagram.com/${co.instagram.slice(1)}` }] : []),
    ...(co.linkedin ? [{ key: 'in', badge: 'IN', label: 'LinkedIn', value: co.linkedin, url: 'https://linkedin.com' }] : []),
    ...(co.facebook ? [{ key: 'fb', badge: 'FB', label: 'Facebook', value: co.facebook, url: 'https://facebook.com' }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <PatternHeader style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BackButton tone="onBlue" onPress={back} />
            <View style={{ flex: 1 }} />
            <IconButton tone="onBlue" icon="share" label="Share company page" onPress={() => toast({ text: `Link copied: 919.app/c/${co.id}`, kind: 'neutral', icon: 'link' })} />
          </View>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View
              style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: '#18191C', borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="displayL" color="#FFFFFF" style={{ fontSize: 24, lineHeight: 30 }}>
                {co.initials}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text variant="displayL" color="#FFFFFF" align="center" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 27 }}>
                {co.name}
              </Text>
              <Text variant="body" color="rgba(255,255,255,0.9)" style={{ fontSize: 14 }}>
                {co.industry} · {co.city}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {co.verified ? (
                <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="verified" size={14} color="successText" />
                  <Text variant="caption" weight={700} color="successText" style={{ fontSize: 12 }}>
                    Verified employer
                  </Text>
                </View>
              ) : null}
              <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="briefcase" size={14} color="#FFFFFF" />
                <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 12 }}>
                  {list.length} active vacanc{list.length === 1 ? 'y' : 'ies'}
                </Text>
              </View>
            </View>
          </View>
        </PatternHeader>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
          <SegmentedTabs<Tab>
            items={[
              { key: 'about', label: 'About' },
              { key: 'vacancies', label: 'Vacancies', count: list.length },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'about' ? (
            <>
              <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 10 }}>
                <Text variant="bodyL" weight={700} accessibilityRole="header">
                  About the company
                </Text>
                <Text variant="body" color="textPrimary" style={{ lineHeight: 22 }}>
                  {co.about}
                </Text>
              </View>
              {links.length ? (
                <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6 }}>
                  <Text variant="bodyL" weight={700} accessibilityRole="header" style={{ marginBottom: 4 }}>
                    {co.website ? (links.length > 1 ? 'Website and social' : 'Website') : 'Social'}
                  </Text>
                  {links.map((l, i) => (
                    <Pressable
                      key={l.key}
                      onPress={() => Linking.openURL(l.url).catch(() => {})}
                      accessibilityRole="link"
                      accessibilityLabel={`${l.label}: ${l.value}`}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                        {l.icon ? (
                          <Icon name={l.icon} size={20} color="link" />
                        ) : (
                          <Text variant="caption" weight={700} color="link" style={{ fontSize: 12 }}>
                            {l.badge}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                          {l.label}
                        </Text>
                        <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                          {l.value}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={18} color="textLightSecondary" />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {list.length ? (
                <Pressable
                  onPress={() => setTab('vacancies')}
                  accessibilityRole="button"
                  style={{ height: 56, borderRadius: 18, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="briefcase" size={20} color="ctaButtonText" />
                  <Text variant="bodyL" weight={700} color="ctaButtonText" style={{ fontSize: 16 }}>
                    See {list.length} active vacanc{list.length === 1 ? 'y' : 'ies'}
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : list.length ? (
            list.map((v) => (
              <VacancyListCard key={v.id} v={v} applied={seeker ? appFor(v.id)?.status : undefined} right={seeker ? <SaveButton vacancyId={v.id} /> : undefined} onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: v.id } })} />
            ))
          ) : (
            <EmptyState icon="briefcase" title="No active vacancies" text={`${co.name} has nothing open right now. Check back soon.`} passive />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
