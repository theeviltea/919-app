import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, FormScreen, Icon, Pressable, SearchBar, StepProgress, Text } from '@/components';
import { fields, type Field } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { useTheme } from '@/theme';

/** Seeker sign-up, step 2 — main field and roles. `?second=1` adds a second field from the review step. */
export default function Occupation() {
  const { c } = useTheme();
  const { second, edit } = useLocalSearchParams<{ second?: string; edit?: string }>();
  const { seeker, setSeeker } = useSignup();
  const taken = second ? seeker.occupations[0]?.field : undefined;
  const current = second ? seeker.occupations[1] : seeker.occupations[0];
  const [field, setField] = useState<Field | undefined>(current?.field);
  const [roles, setRoles] = useState<string[]>(current?.roles ?? []);
  const [open, setOpen] = useState<Field | undefined>(current?.field ?? (second ? undefined : 'model'));
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const list = fields
    .filter((f) => f.key !== taken)
    .map((f) => ({ ...f, roles: query ? f.roles.filter((r) => r.toLowerCase().includes(query)) : f.roles }))
    .filter((f) => !query || f.roles.length || f.label.toLowerCase().includes(query));

  const toggle = (f: Field, r: string) => {
    if (field !== f) {
      setField(f);
      setRoles([r]);
      return;
    }
    const next = roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r];
    setRoles(next);
    if (!next.length) setField(undefined);
  };

  const save = () => {
    if (!field) return;
    setSeeker((s) => {
      const prev = s.occupations[second ? 1 : 0];
      const entry = { field, roles, details: prev?.field === field ? prev.details : {}, links: prev?.field === field ? prev.links : [], tattoos: prev?.tattoos, piercing: prev?.piercing };
      const occ = [...s.occupations];
      occ[second ? 1 : 0] = entry;
      return { occupations: second ? occ : [entry, ...occ.slice(1)] };
    });
    router.push({ pathname: '/signup/details', params: { ...(second ? { second: '1' } : {}), ...(edit ? { edit: '1' } : {}) } });
  };

  return (
    <FormScreen
      top={edit ? undefined : <StepProgress step={2} of={5} />}
      title={second ? 'Add a second field' : 'What do you do?'}
      subtitle={second ? 'Pick another field you work in. Photos and video stay the same.' : 'Pick your main field and roles. You can add a second field at the end.'}
      footer={<Button size="l" label="Continue" disabled={!field || !roles.length} onPress={save} />}>
      <SearchBar variant="page" value={q} onChangeText={setQ} placeholder="Search a role, e.g. hostess" />
      <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 8, gap: 2 }}>
        <Text variant="caption" weight={700} color="textBody" style={{ letterSpacing: 0.6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 }}>
          FIELDS
        </Text>
        {list.map((f, i) => {
          const isOpen = open === f.key || !!query;
          const selected = field === f.key;
          return (
            <View key={f.key} style={{ borderRadius: 18, backgroundColor: isOpen ? c.input : 'transparent', borderTopWidth: i && !isOpen ? 1 : 0, borderColor: c.divider }}>
              <Pressable
                onPress={() => setOpen(open === f.key ? undefined : f.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, minHeight: 56 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isOpen ? c.surface : c.input, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={f.icon} size={20} color={selected ? 'primary' : 'textBody'} />
                </View>
                <Text variant="bodyL" weight={700} style={{ flex: 1 }}>
                  {f.label}
                </Text>
                {selected ? (
                  <>
                    <Text variant="bodyS" color="textBody">
                      {roles.length} selected
                    </Text>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={14} color="ctaButtonText" />
                    </View>
                  </>
                ) : (
                  <Icon name="chevron-down" size={18} color="textBody" />
                )}
              </Pressable>
              {isOpen ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 58, paddingRight: 10, paddingBottom: 14 }}>
                  {f.roles.map((r) => (
                    <Chip key={r} label={r} check selected={field === f.key && roles.includes(r)} onPress={() => toggle(f.key, r)} />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
        {list.length === 0 ? (
          <Text variant="body" color="textBody" style={{ padding: 16 }}>
            No roles match “{q}”. Try “model”, “DJ” or “waiter”.
          </Text>
        ) : null}
      </View>
      {field && roles.length ? (
        <Text variant="bodyS" color="textBody">
          One field at a time. Roles from another field replace this choice.
        </Text>
      ) : null}
    </FormScreen>
  );
}
