import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Icon, Pressable, Text } from '@/components';
import { fieldByKey } from '@/data/registration';
import { jobPeriod, linkKinds, studyPeriod, useSeeker } from '@/data/seeker';
import { CodeTile, DashedButton, Panel, SubScreen, TimelineItem } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function More({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="more" size={20} color="textBody" />
    </Pressable>
  );
}

/** Professional: occupations, experience, education, portfolio and socials. Each entry opens its own editor. */
export default function Professional() {
  const { c } = useTheme();
  const { profile: p } = useSeeker();

  return (
    <SubScreen title="Professional" footer={<Button size="l" label="Save changes" onPress={() => router.back()} />}>
      <Panel title="Occupations" gap={6}>
        <View>
          {p.occupations.map((o, i) => (
            <View key={o.field} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < p.occupations.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="bodyL" weight={600}>
                    {fieldByKey(o.field).label}
                  </Text>
                  {i === 0 ? (
                    <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.primarySecondary, justifyContent: 'center' }}>
                      <Text variant="caption" weight={700} color="link" style={{ fontSize: 11, lineHeight: 14 }}>
                        Primary
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="bodyS" color="textBody" style={{ marginTop: 4, fontSize: 13 }}>
                  {o.roles.join(' · ')}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/profile/field/[field]', params: { field: o.field } })}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${fieldByKey(o.field).label}`}
                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="edit" size={18} color="textHeadline" />
              </Pressable>
            </View>
          ))}
        </View>
        <DashedButton label={p.occupations.length < 2 ? 'Add occupation' : 'Change occupations'} onPress={() => router.push('/profile/occupations')} />
      </Panel>

      <Panel title="Experience" gap={6}>
        {p.experience.length ? (
          <View>
            {p.experience.map((j, i) => (
              <TimelineItem
                key={j.id}
                title={j.role}
                sub={`${j.company} · ${j.city}`}
                meta={jobPeriod(j)}
                last={i === p.experience.length - 1}
                right={<More label={`Edit ${j.role}`} onPress={() => router.push({ pathname: '/profile/experience', params: { id: j.id } })} />}
              />
            ))}
          </View>
        ) : (
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Venues and roles you worked in. Employers trust profiles with experience more.
          </Text>
        )}
        <DashedButton label="Add experience" onPress={() => router.push('/profile/experience')} />
      </Panel>

      <Panel title="Education" gap={6}>
        {p.education.length ? (
          <View>
            {p.education.map((e, i) => (
              <TimelineItem
                key={e.id}
                title={[e.degree, e.field].filter(Boolean).join(', ')}
                sub={e.institution}
                meta={studyPeriod(e)}
                last={i === p.education.length - 1}
                right={<More label={`Edit ${e.institution}`} onPress={() => router.push({ pathname: '/profile/education', params: { id: e.id } })} />}
              />
            ))}
          </View>
        ) : null}
        <DashedButton label="Add education" onPress={() => router.push('/profile/education')} />
      </Panel>

      <Panel title="Portfolio and socials" gap={6}>
        {p.links.length ? (
          <View>
            {p.links.map((l, i) => (
              <View key={l.id} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < p.links.length - 1 ? 1 : 0, borderColor: c.divider }}>
                <CodeTile code={linkKinds[l.kind].code} size={36} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                    {linkKinds[l.kind].label}
                  </Text>
                  <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ fontSize: 13 }}>
                    {l.value}
                  </Text>
                </View>
                <Pressable onPress={() => router.push('/profile/links')} accessibilityRole="button" accessibilityLabel={`Edit ${linkKinds[l.kind].label}`} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="edit" size={18} color="textBody" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <DashedButton label="Add link" onPress={() => router.push({ pathname: '/profile/links', params: { add: '1' } })} />
      </Panel>
    </SubScreen>
  );
}
