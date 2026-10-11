import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { fields, type Field } from '@/data/registration';
import { useSoon } from '@/features/hire/ui';
import { useTheme } from '@/theme';

/** New vacancy, step 1 of 4 — field and role (VacCategory / VacCategoryOpen). One field, any of its roles. */
export default function VacancyCategory() {
  const { c } = useTheme();
  const soon = useSoon();
  const [open, setOpen] = useState<Field | undefined>();
  const [field, setField] = useState<Field | undefined>();
  const [roles, setRoles] = useState<string[]>([]);

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

  return (
    <FormScreen
      top={<StepProgress label="New vacancy" step={1} of={4} />}
      title="Add vacancy"
      subtitle="Choose the field and the role you are hiring for."
      footer={<Button size="l" label="Proceed" disabled={!field || !roles.length} onPress={() => soon('Step 2 · Basic information')} />}>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingBottom: 8 }}>
        <Text variant="caption" weight={700} color="textBody" style={{ letterSpacing: 0.7, paddingTop: 16, paddingBottom: 4 }}>
          FIELDS
        </Text>
        {fields.map((f, i) => {
          const isOpen = open === f.key;
          const selected = field === f.key;
          return (
            <View key={f.key} style={{ borderRadius: 18, backgroundColor: isOpen ? c.input : 'transparent', marginHorizontal: isOpen ? -8 : 0, marginVertical: isOpen ? 4 : 0, paddingHorizontal: isOpen ? 12 : 0, paddingBottom: isOpen ? 14 : 0 }}>
              <Pressable
                onPress={() => setOpen(isOpen ? undefined : f.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                style={{ height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: !isOpen && i < fields.length - 1 && open !== fields[i + 1]?.key ? 1 : 0, borderColor: c.divider }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isOpen ? c.surface : c.input, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={f.icon} size={20} color={isOpen || selected ? 'primary' : 'textBody'} />
                </View>
                <Text variant="bodyL" weight={600} style={{ flex: 1, fontSize: 16 }}>
                  {f.label}
                </Text>
                {selected ? (
                  <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                    {roles.length} selected
                  </Text>
                ) : null}
                <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                  <Icon name="chevron-down" size={18} color="textLightSecondary" />
                </View>
              </Pressable>
              {isOpen ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 52 }}>
                  {f.roles.map((r) => (
                    <Chip key={r} label={r} check selected={selected && roles.includes(r)} onPress={() => toggle(f.key, r)} />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </FormScreen>
  );
}
