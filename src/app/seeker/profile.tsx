import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, Share, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, Pressable, StatusBanner, TAB_BAR_SPACE, Text, type IconName } from '@/components';
import { countryShort, fieldByKey, occupationRows } from '@/data/registration';
import { useSeeker } from '@/data/seeker';
import { useTheme } from '@/theme';

function Section({ title, action, children }: { title: string; action?: { label: string; icon?: IconName; onPress: () => void }; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text variant="bodyL" weight={700} style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </Text>
        {action ? (
          <Pressable onPress={action.onPress} accessibilityRole="button" accessibilityLabel={`${action.label} — ${title}`} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name={action.icon ?? 'edit'} size={16} color="link" />
            <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
        {value}
      </Text>
      <Text variant="caption" weight={400} color="textBody">
        {label}
      </Text>
    </View>
  );
}

function Timeline({ items }: { items: { title: string; sub: string; meta: string }[] }) {
  const { c } = useTheme();
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', width: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: i === 0 ? c.primary : c.control }} />
            {i < items.length - 1 ? <View style={{ flex: 1, width: 2, backgroundColor: c.divider, marginVertical: 4 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: i < items.length - 1 ? 16 : 0 }}>
            <Text variant="body" weight={700}>
              {it.title}
            </Text>
            <Text variant="bodyS" color="textBody">
              {it.sub}
            </Text>
            <Text variant="caption" weight={400} color="textLightSecondary" style={{ marginTop: 2 }}>
              {it.meta}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Seeker profile — what employers see, with edit entry points. */
export default function Profile() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profile: p, hidden, setHidden } = useSeeker();
  const [more, setMore] = useState(false);
  const pageW = Math.min(width, 640) - 40;
  const tile = Math.floor((pageW - 36 - 16) / 3);
  const photos = p.photos.filter((x) => x.progress === undefined);
  const location = [p.city, p.country ? (countryShort[p.country] ?? p.country) : undefined].filter(Boolean).join(', ');
  const name = `${p.firstName} ${p.lastName}`.trim() || 'Your name';
  const longAbout = p.about.length > 160;

  return (
    <View style={{ flex: 1, backgroundColor: c.back }}>
      <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 16 }}>
        {/* header band */}
        <View style={{ backgroundColor: c.primary, paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 72 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
            <Text variant="displayL" color="ctaButtonText" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30, flex: 1 }}>
              Profile
            </Text>
            <IconButton icon="share" label="Share profile" tone="onBlue" onPress={() => Share.share({ message: `${name} on 919 — 919.ae/u/${p.firstName.toLowerCase() || 'me'}` })} />
            <IconButton icon="settings" label="Settings" tone="onBlue" onPress={() => router.push('/profile/settings')} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12, marginTop: -56, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 28, padding: 18, paddingTop: 0, gap: 12, alignItems: 'center' }}>
            <View style={{ marginTop: -44 }}>
              {p.photo ? (
                <Image source={p.photo} contentFit="cover" style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: c.surface, backgroundColor: c.backDarker }} />
              ) : (
                <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: c.surface, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={40} color="primary" />
                </View>
              )}
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="title" style={{ fontSize: 22, lineHeight: 28 }}>
                  {name}
                </Text>
                {p.verified ? <Icon name="verified" size={20} color="primary" /> : null}
              </View>
              <Text variant="body" color="textBody">
                {[p.age ? `${p.age} y.o.` : null, p.gender].filter(Boolean).join(' · ')}
              </Text>
              {location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="location" size={16} color="textBody" />
                  <Text variant="bodyS" color="textBody">
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
              {p.occupations.flatMap((o) => o.roles).map((r) => (
                <View key={r} style={{ height: 30, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.primarySecondary, justifyContent: 'center' }}>
                  <Text variant="bodyS" weight={600} color="link">
                    {r}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignSelf: 'stretch', paddingTop: 14, borderTopWidth: 1, borderColor: c.divider }}>
              <Stat value={p.stats.views} label="Profile views" />
              <Stat value={p.stats.applications} label="Applications" />
              <Stat value={p.stats.invites} label="Invites" />
            </View>
            <Button variant="tonal" icon="edit" label="Edit profile" onPress={() => router.push({ pathname: '/auth/about', params: { edit: '1' } })} style={{ alignSelf: 'stretch' }} />
          </View>

          {hidden ? (
            <StatusBanner kind="attention" icon="eye-off" title="Your profile is hidden" subtitle="Employers can’t find you or send contact requests. Your applications still work.">
              <Button variant="neutral" size="s" label="Show my profile" onPress={() => setHidden(false)} />
            </StatusBanner>
          ) : null}

          <Section title={`Photos · ${photos.length}`} action={{ label: 'Edit', onPress: () => router.push({ pathname: '/signup/media', params: { edit: '1' } }) }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.slice(0, 9).map((ph) => (
                <Image key={ph.id} source={ph.source} contentFit="cover" style={{ width: tile, height: tile * 1.25, borderRadius: 14, backgroundColor: c.backDarker }} />
              ))}
              {photos.length < 9 ? (
                <Pressable
                  onPress={() => router.push({ pathname: '/signup/media', params: { edit: '1' } })}
                  accessibilityRole="button"
                  accessibilityLabel="Add photos"
                  style={{ width: tile, height: tile * 1.25, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Icon name="add" size={22} color="primary" />
                  <Text variant="caption" weight={600} color="link">
                    Add
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Section>

          <Section title="Video presentation" action={p.video ? { label: 'Replace', onPress: () => router.push({ pathname: '/signup/media', params: { edit: '1' } }) } : undefined}>
            {p.video ? (
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <View style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <Image source={p.video.poster} contentFit="cover" style={{ width: 96, height: 128, backgroundColor: c.backDarker }} />
                  <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.mediaOverlay, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="play" size={18} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="body" weight={700}>
                    Intro · {p.video.duration}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="view" size={16} color="textBody" />
                    <Text variant="bodyS" color="textBody">
                      {p.stats.videoViews} views by employers
                    </Text>
                  </View>
                  <Text variant="bodyS" color="textBody">
                    Profiles with a video get 3× more invites.
                  </Text>
                </View>
              </View>
            ) : (
              <Button variant="secondary" icon="video" label="Add video presentation" onPress={() => router.push({ pathname: '/signup/media', params: { edit: '1' } })} />
            )}
          </Section>

          <Section title="About" action={p.about ? { label: 'Edit', onPress: () => router.push('/profile/edit-about') } : undefined}>
            {p.about ? (
              <>
                <Text variant="body" color="textPrimary" numberOfLines={more ? undefined : 4} style={{ lineHeight: 22 }}>
                  {p.about}
                </Text>
                {longAbout ? (
                  <Pressable onPress={() => setMore(!more)} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'flex-start' }}>
                    <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
                      {more ? 'Show less' : 'Show more'}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <Pressable
                onPress={() => router.push('/profile/edit-about')}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed }}>
                <Icon name="edit" size={20} color="primary" />
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight={700}>
                    Tell employers about yourself
                  </Text>
                  <Text variant="bodyS" color="textBody">
                    Required to apply · experience, strengths, availability
                  </Text>
                </View>
              </Pressable>
            )}
          </Section>

          {p.languages.length ? (
            <Section title="Languages">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {p.languages.map((l) => (
                  <View key={l.code} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingLeft: 6, paddingRight: 12, borderRadius: 999, backgroundColor: c.input }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="caption" weight={700}>
                        {l.code}
                      </Text>
                    </View>
                    <Text variant="bodyS" weight={600}>
                      {l.name}
                    </Text>
                    <Text variant="bodyS" color="textBody">
                      {l.level}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {p.experience.length ? (
            <Section title="Experience">
              <Timeline items={p.experience.map((j) => ({ title: j.role, sub: j.place, meta: `${j.period} · ${j.length}` }))} />
            </Section>
          ) : null}

          {p.education.length ? (
            <Section title="Education">
              <Timeline items={p.education.map((e) => ({ title: e.title, sub: e.place, meta: e.period }))} />
            </Section>
          ) : null}

          {p.occupations.map((o, i) => {
            const f = fieldByKey(o.field);
            const rows = occupationRows(o, false);
            return (
              <Section key={o.field} title={f.label} action={{ label: 'Edit', onPress: () => router.push({ pathname: '/signup/occupation', params: i ? { second: '1', edit: '1' } : { edit: '1' } }) }}>
                <Text variant="bodyS" color="textBody">
                  {o.roles.join(' · ')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                  {rows.map(([l, val]) => (
                    <View key={l} style={{ width: '50%', padding: 4 }}>
                      <View style={{ backgroundColor: c.surfaceInset, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 }}>
                        <Text variant="caption" weight={400} color="textBody">
                          {l}
                        </Text>
                        <Text variant="body" weight={700}>
                          {val}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Section>
            );
          })}

          {p.links.length ? (
            <Section title="Portfolio & socials">
              {p.links.map((l, i) => (
                <View key={l.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: i < p.links.length - 1 ? 12 : 0, borderBottomWidth: i < p.links.length - 1 ? 1 : 0, borderColor: c.divider }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text variant="caption" weight={700} color="link">
                      {l.kind}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyS" color="textBody">
                      {l.label}
                    </Text>
                    <Text variant="body" weight={600} numberOfLines={1}>
                      {l.value}
                    </Text>
                  </View>
                  <Icon name="link" size={18} color="textLightSecondary" />
                </View>
              ))}
            </Section>
          ) : null}

          {!hidden ? (
            <Pressable onPress={() => setHidden(true)} accessibilityRole="button" style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
              <Icon name="eye-off" size={16} color="textBody" />
              <Text variant="bodyS" weight={600} color="textBody">
                Hide my profile from employers
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
