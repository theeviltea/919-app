import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { linkKinds, useSeeker, type LinkKind, type ProfileLink } from '@/data/seeker';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { CodeTile, DashedButton, Panel, SubScreen } from '@/features/profile/ui';

const SOCIAL: LinkKind[] = ['soundcloud', 'instagram', 'facebook', 'tiktok', 'youtube', 'spotify', 'linkedin'];
const valid = (k: LinkKind, v: string) => !v.trim() || (v.trim().startsWith('@') && k !== 'web' ? /^@[\w.]{2,}$/.test(v.trim()) : /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v.trim()));
let seq = 0;

/** Portfolio and socials. Empty rows are dropped on save. */
export default function Links() {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const toast = useToast();
  const { profile, updateProfile } = useSeeker();
  const [web, setWeb] = useState(profile.links.find((l) => l.kind === 'web')?.value ?? '');
  const [social, setSocial] = useState<ProfileLink[]>(profile.links.filter((l) => l.kind !== 'web'));
  const [sheet, setSheet] = useState(!!add);
  const left = SOCIAL.filter((k) => !social.some((s) => s.kind === k));
  const ok = valid('web', web) && social.every((s) => valid(s.kind, s.value));

  const save = () => {
    const links: ProfileLink[] = [...(web.trim() ? [{ id: 'web', kind: 'web' as const, value: web.trim() }] : []), ...social.filter((s) => s.value.trim()).map((s) => ({ ...s, value: s.value.trim() }))];
    updateProfile({ links });
    toast({ text: 'Links saved', icon: 'check', aboveTabBar: true });
    router.back();
  };

  const row = (k: LinkKind, value: string, onChange: (v: string) => void, onRemove: () => void, key: string) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <CodeTile code={linkKinds[k].code} size={40} />
      <View style={{ flex: 1 }}>
        <Field
          onSurface
          label={k === 'web' ? 'Website' : linkKinds[k].label}
          value={value}
          onChangeText={onChange}
          placeholder={linkKinds[k].placeholder}
          autoCapitalize="none"
          keyboardType="url"
          error={valid(k, value) ? undefined : 'Paste a full link or @username'}
        />
      </View>
      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${linkKinds[k].label}`} hitSlop={6} style={{ width: 32, height: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="cancel" size={18} color="textLightSecondary" />
      </Pressable>
    </View>
  );

  return (
    <SubScreen title="Links" footer={<Button size="l" label="Save" disabled={!ok} onPress={save} />}>
      <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20, paddingHorizontal: 4 }}>
        Employers open these from your profile. Paste a full link or a username.
      </Text>
      <Panel title="Portfolio" gap={10}>
        {row('web', web, setWeb, () => setWeb(''), 'web')}
      </Panel>
      <Panel title="Socials and music" gap={10}>
        {social.map((s) =>
          row(
            s.kind,
            s.value,
            (v) => setSocial(social.map((x) => (x.id === s.id ? { ...x, value: v } : x))),
            () => setSocial(social.filter((x) => x.id !== s.id)),
            s.id,
          ),
        )}
        {left.length ? <DashedButton label="Add link" onPress={() => setSheet(true)} /> : null}
      </Panel>
      <SelectSheet
        visible={sheet}
        title="Add link"
        options={left.map((k) => linkKinds[k].label)}
        onClose={() => setSheet(false)}
        onSelect={(label) => {
          const k = left.find((x) => linkKinds[x].label === label);
          if (k) setSocial([...social, { id: `n${Date.now()}${++seq}`, kind: k, value: '' }]);
          setSheet(false);
        }}
      />
    </SubScreen>
  );
}
