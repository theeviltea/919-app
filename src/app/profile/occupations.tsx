import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Icon, Pressable, SearchBar, Text, useToast } from '@/components';
import { fields, type Field } from '@/data/registration';
import { useSignup, type FieldEntry } from '@/data/signup';
import { SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Pick = { field: Field; roles: string[] };

/** Occupations: up to two fields with their roles. The first one is Primary. */
export default function Occupations() {
  const { c } = useTheme();
  const toast = useToast();
  const { seeker, setSeeker } = useSignup();
  const [picks, setPicks] = useState<Pick[]>(seeker.occupations.map((o) => ({ field: o.field, roles: o.roles })));
  const [open, setOpen] = useState<Field | null>(seeker.occupations[0]?.field ?? null);
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const toggleRole = (field: Field, role: string) => {
    const cur = picks.find((x) => x.field === field);
    if (!cur) {
      if (picks.length >= 2) return toast({ text: 'Up to 2 fields. Remove a role from another field first', kind: 'neutral', icon: 'alert-circle' });
      return setPicks([...picks, { field, roles: [role] }]);
    }
    const roles = cur.roles.includes(role) ? cur.roles.filter((r) => r !== role) : [...cur.roles, role];
    setPicks(roles.length ? picks.map((x) => (x.field === field ? { ...x, roles } : x)) : picks.filter((x) => x.field !== field));
  };
  const makePrimary = (field: Field) => setPicks([...picks.filter((x) => x.field === field), ...picks.filter((x) => x.field !== field)]);

  const save = () => {
    const next: FieldEntry[] = picks.map((pk) => {
      const prev = seeker.occupations.find((o) => o.field === pk.field);
      return prev ? { ...prev, roles: pk.roles } : { field: pk.field, roles: pk.roles, details: {}, links: [] };
    });
    setSeeker({ occupations: next });
    // A new body / model / music field needs its questionnaire before it shows in the profile.
    const fresh = next.find((o) => !seeker.occupations.some((x) => x.field === o.field) && fields.find((f) => f.key === o.field)?.form !== 'service');
    if (fresh) router.replace({ pathname: '/profile/field/[field]', params: { field: fresh.field, fresh: '1' } });
    else router.back();
  };

  const visible = fields.filter((f) => !query || f.label.toLowerCase().includes(query) || f.roles.some((r) => r.toLowerCase().includes(query)));

  return (
    <SubScreen title="Occupations" gap={14} footer={<Button size="l" label="Save changes" disabled={!picks.length} onPress={save} />}>
      <Text variant="body" color="textPrimary" style={{ fontSize: 14, lineHeight: 20 }}>
        Your main field is marked Primary. Select a second one if you work in two areas.
      </Text>
      <SearchBar value={q} onChangeText={setQ} placeholder="Search a role, e.g. hostess" />
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingBottom: 6 }}>
        <Text variant="caption" weight={700} color="textBody" style={{ paddingTop: 16, paddingBottom: 4, letterSpacing: 0.7 }}>
          FIELDS
        </Text>
        {visible.map((f, i) => {
          const pk = picks.find((x) => x.field === f.key);
          const primary = picks[0]?.field === f.key;
          const expanded = open === f.key || !!query;
          const roles = query ? f.roles.filter((r) => r.toLowerCase().includes(query) || f.label.toLowerCase().includes(query)) : f.roles;
          const header = (
            <Pressable
              onPress={() => setOpen(open === f.key ? null : f.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: !expanded && i < visible.length - 1 ? 1 : 0, borderColor: c.divider }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: expanded ? c.surface : pk ? c.primarySecondary : c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={f.icon} size={20} color={pk ? 'primary' : 'textBody'} />
              </View>
              <Text variant="bodyL" weight={600} numberOfLines={1} style={{ flex: 1 }}>
                {f.label}
              </Text>
              {primary ? (
                <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.inverse, justifyContent: 'center' }}>
                  <Text variant="caption" weight={700} color="onInverse" style={{ fontSize: 11, lineHeight: 14 }}>
                    Primary
                  </Text>
                </View>
              ) : pk && !expanded ? (
                <Text variant="bodyS" weight={500} color="textBody" numberOfLines={1} style={{ fontSize: 13, maxWidth: 96 }}>
                  {pk.roles.join(', ')}
                </Text>
              ) : null}
              {pk ? (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={13} color="#FFFFFF" />
                </View>
              ) : (
                <Icon name="chevron-down" size={18} color="textLightSecondary" />
              )}
            </Pressable>
          );
          if (!expanded) return <View key={f.key}>{header}</View>;
          return (
            <View key={f.key} style={{ borderRadius: 18, backgroundColor: c.input, paddingHorizontal: 12, paddingBottom: 14, marginHorizontal: -8, marginVertical: 4 }}>
              {header}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 52 }}>
                {roles.map((r) => (
                  <Chip key={r} label={r} check selected={!!pk?.roles.includes(r)} onPress={() => toggleRole(f.key, r)} />
                ))}
              </View>
              {pk && !primary ? (
                <Pressable onPress={() => makePrimary(f.key)} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginLeft: 52, marginTop: 10 }}>
                  <Text variant="bodyS" weight={700} color="link">
                    Make primary
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </SubScreen>
  );
}
