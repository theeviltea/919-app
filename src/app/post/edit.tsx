import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, EmptyState, Icon, Pressable, Text, useToast, type IconName } from '@/components';
import { useEmployer } from '@/data/employer';
import { fieldByKey } from '@/data/registration';
import { Pill } from '@/features/hire/ui';
import { draftFromVacancy, payPreview, useDraft, type VacancyDraft } from '@/features/post/draft';
import { detailFromDraft } from '@/features/post/requirements';
import { useTheme } from '@/theme';

type Section = 'category' | 'basic' | 'salary' | 'requirements';
const keysOf: Record<Section, (keyof VacancyDraft)[]> = {
  category: ['field', 'roles'],
  basic: ['cover', 'title', 'description', 'startDate', 'country', 'city', 'photos'],
  salary: ['contract', 'amountMode', 'currency', 'amount'],
  requirements: ['sex', 'age', 'params', 'languages'],
};
const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

/** Which sections the moderation's corrections point at ("Replace the cover photo" → Basic information). */
function flagged(items: string[]): Section[] {
  const out = new Set<Section>();
  for (const t of items.map((x) => x.toLowerCase())) {
    if (/cover|photo|description|title|hours|date|address|location/.test(t)) out.add('basic');
    if (/salary|pay|aed|amount|rate/.test(t)) out.add('salary');
    if (/age|language|gender|requirement/.test(t)) out.add('requirements');
    if (/role|field|category/.test(t)) out.add('category');
  }
  return [...out];
}

/** Edit vacancy (VacEdit / VacEditChanges): sections of the posting form; saving sends the vacancy back to review. */
export default function EditVacancy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { vacancies, resubmitVacancy } = useEmployer();
  const { d, editing, original, startEdit, reset } = useDraft();
  const v = vacancies.find((x) => x.id === id);

  useEffect(() => {
    if (v?.detail && editing !== v.id) startEdit(v.id, draftFromVacancy(v));
  }, [v, editing, startEdit]);

  const leave = () => {
    reset();
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/my-vacancy/[id]', params: { id } });
  };

  if (!v || !v.detail) {
    return (
      <View style={{ flex: 1, backgroundColor: c.back, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <BackButton onPress={leave} />
        <EmptyState icon="briefcase" title="Vacancy not found" text="It may have been deleted." passive />
      </View>
    );
  }
  if (editing !== v.id || !original) return <View style={{ flex: 1, backgroundColor: c.back }} />;

  const changed = (s: Section) => keysOf[s].some((k) => !same(d[k], original[k]));
  const anyChange = (Object.keys(keysOf) as Section[]).some(changed);
  const fix = v.changes ? flagged(v.changes.items) : [];
  const mustFix = v.status === 'changes' || v.status === 'rejected';

  const sections: { key: Section; icon: IconName; title: string; value: string; route: '/post/category' | '/post/basic' | '/post/salary' | '/post/requirements' }[] = [
    { key: 'category', icon: 'briefcase', title: 'Field and role', value: [d.field ? fieldByKey(d.field).label : 'Not set', d.roles.join(', ')].filter(Boolean).join(' · '), route: '/post/category' },
    { key: 'basic', icon: 'image', title: 'Basic information', value: `${d.title} · ${d.city} · ${d.photos.length + 1} photos`, route: '/post/basic' },
    { key: 'salary', icon: 'wallet', title: 'Salary', value: payPreview(d), route: '/post/salary' },
    {
      key: 'requirements',
      icon: 'users',
      title: 'Requirements',
      value: [d.sex === 'Any' ? 'Any sex' : d.sex, d.age && d.age !== 'Any' ? `age ${d.age}` : 'any age', d.languages.length ? d.languages.map((l) => l.name).join(', ') : '']
        .filter(Boolean)
        .join(' · '),
      route: '/post/requirements',
    },
  ];

  const send = () => {
    const detail = { ...detailFromDraft(d, 'On review'), views: v.detail!.views };
    resubmitVacancy(v.id, { title: d.title.trim(), cover: d.cover!, meta: `${detail.category} · ${payPreview(d)}`, detail });
    reset();
    if (router.canGoBack()) router.back();
    toast({ text: 'Changes sent for review · usually within an hour', icon: 'check' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 140, gap: 12, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BackButton onPress={leave} />
          <Text variant="bodyL" weight={700} align="center" accessibilityRole="header" style={{ flex: 1, fontSize: 17, marginRight: 44 }}>
            Edit vacancy
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: c.surface }}>
          <Image source={d.cover ?? v.cover} contentFit="cover" style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: c.backDarker }} />
          <View style={{ flex: 1, minWidth: 0, gap: 6, alignItems: 'flex-start' }}>
            <Text variant="bodyL" weight={700} numberOfLines={1} style={{ fontSize: 16, alignSelf: 'stretch' }}>
              {d.title || v.title}
            </Text>
            {v.status === 'active' ? (
              <Pill label={`Active · ${v.note.split(' · ')[0]}`} bg={c.successBack} fg={c.successText} h={24} />
            ) : v.status === 'changes' ? (
              <Pill label="Changes needed" icon="edit" bg={c.attentionBack} fg={c.attentionText} h={24} />
            ) : v.status === 'rejected' ? (
              <Pill label="Rejected" icon="alert-circle" bg={c.dangerBack} fg={c.dangerText} h={24} />
            ) : v.status === 'review' ? (
              <Pill label="On review" icon="clock" bg={c.input} fg={c.textBody} h={24} />
            ) : (
              <Pill label="In archive" bg={c.input} fg={c.textBody} h={24} />
            )}
          </View>
        </View>

        {v.status === 'changes' && v.changes ? (
          <View style={{ padding: 16, borderRadius: 20, backgroundColor: c.attentionBack, gap: 10 }}>
            <Text variant="body" weight={700} style={{ fontSize: 15 }}>
              Fix {v.changes.items.length} things from the 919 team
            </Text>
            {v.changes.items.map((t, i) => (
              <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.urgent, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" weight={700} color="onUrgent" style={{ fontSize: 12 }}>
                    {i + 1}
                  </Text>
                </View>
                <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {v.status === 'rejected' && v.rejected ? (
          <View style={{ padding: 16, borderRadius: 20, backgroundColor: c.dangerBack, gap: 6 }}>
            <Text variant="body" weight={700} color="dangerText" style={{ fontSize: 15 }}>
              Rejected · {v.rejected.short}
            </Text>
            <Text variant="bodyS" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
              Remove what breaks the 919 rules and send it again. Repeated violations block the company account.
            </Text>
          </View>
        ) : null}

        <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 16 }}>
          {sections.map((s, i) => {
            const edited = changed(s.key);
            const needs = fix.includes(s.key) && !edited;
            return (
              <Pressable
                key={s.key}
                onPress={() => router.push(s.route)}
                accessibilityRole="button"
                accessibilityLabel={s.title}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderColor: c.divider }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: needs ? c.attentionBack : c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={20} color={needs ? 'attentionText' : 'link'} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyL" weight={600} style={{ fontSize: 16 }}>
                    {s.title}
                  </Text>
                  <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                    {s.value}
                  </Text>
                </View>
                {edited ? (
                  <Pill label="Edited" icon="check" bg={c.primarySecondary} fg={c.link} h={24} />
                ) : needs ? (
                  <Pill label="Fix" icon="edit" bg={c.attentionBack} fg={c.attentionText} h={24} />
                ) : null}
                <Icon name="chevron-right" size={18} color="textLightSecondary" />
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.surface }}>
          <Icon name="clock" size={18} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
            {v.status === 'active'
              ? 'Saved changes go through moderation again, usually within an hour. Applicants and chats stay; paid Urgent keeps running.'
              : 'After you send, the vacancy goes back to review, usually within an hour. We’ll notify you as soon as it’s live.'}
          </Text>
        </View>
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
          backgroundColor: c.surfacePanel,
          borderTopWidth: 1,
          borderColor: c.divider,
        }}>
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <Button size="l" label={mustFix ? 'Send for review' : 'Save and send for review'} disabled={!anyChange} onPress={send} />
        </View>
      </View>
    </View>
  );
}
