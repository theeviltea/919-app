import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { mockImg } from '@/data/mock';
import { allCountries, citiesFor, countryCode, popularCountryNames } from '@/data/registration';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { LogoTile } from '@/features/hire/LogoTile';
import { Panel, SubScreen } from '@/features/profile/ui';

const INDUSTRIES = ['Hospitality', 'F&B', 'Events', 'Model agency', 'Music and entertainment', 'Beauty', 'Retail', 'Other'];
const SIZES = ['1–10 employees', '10–50 employees', '50–200 employees', '200–1000 employees', '1000+ employees'];
const YEARS = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => String(2026 - i));
const MAX_ABOUT = 1000;

type Sheet = 'logo' | 'industry' | 'size' | 'founded' | 'country' | 'city' | null;

/** Employer — Company details (EmpEditCompany): logo, name, industry, size, founded, about, location. */
export default function CompanyDetailsEdit() {
  const toast = useToast();
  const { info, setInfo } = useEmployer();
  const [f, setF] = useState(info);
  const [sheet, setSheet] = useState<Sheet>(null);
  const set = (u: Partial<typeof f>) => setF((x) => ({ ...x, ...u }));
  const dirty = (Object.keys(f) as (keyof typeof f)[]).some((k) => f[k] !== info[k]);
  const ok = f.name.trim() && f.industry && f.about.trim() && f.country && f.city;

  const save = () => {
    const renamed = f.name.trim() !== info.name;
    setInfo({ ...f, name: f.name.trim(), about: f.about.trim() });
    toast({ text: renamed ? 'Saved. The new name goes for a quick re-check' : 'Changes saved', icon: 'check' });
    router.back();
  };

  return (
    <SubScreen title="Company details" footer={<Button size="l" label="Save changes" disabled={!ok || !dirty} onPress={save} />}>
      <Panel style={{ alignItems: 'center', gap: 6 }}>
        <LogoTile info={f} size={96} onPress={() => setSheet('logo')} />
        <Text variant="body" weight={700} style={{ marginTop: 10, fontSize: 15 }}>
          Company logo *
        </Text>
        <Text variant="bodyS" color="textBody" align="center" style={{ fontSize: 13 }}>
          Square image, at least 400×400 px
        </Text>
      </Panel>

      <Panel title="Company" gap={8}>
        <Field onSurface label="Company name" required value={f.name} onChangeText={(v) => set({ name: v })} error={f.name.trim() ? undefined : 'Required'} />
        <Field onSurface label="Industry" required value={f.industry} onPress={() => setSheet('industry')} rightIcon="chevron-down" />
        <Field onSurface label="Company size" value={f.size} onPress={() => setSheet('size')} rightIcon="chevron-down" />
        <Field onSurface label="Founded" value={f.founded} onPress={() => setSheet('founded')} rightIcon="chevron-down" />
      </Panel>

      <Panel gap={8}>
        <View style={{ gap: 2, marginBottom: 4 }}>
          <Text variant="bodyL" weight={700} accessibilityRole="header">
            About the company
          </Text>
          <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
            Shown on every vacancy you post
          </Text>
        </View>
        <Field onSurface label="Description" required value={f.about} onChangeText={(v) => set({ about: v })} multiline maxLength={MAX_ABOUT} counter />
      </Panel>

      <Panel title="Location" gap={8}>
        <Field onSurface label="Country" required value={f.country} onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field onSurface label="City" required value={f.city} placeholder="Select" onPress={() => setSheet('city')} rightIcon="chevron-down" />
      </Panel>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
        <Icon name="alert-circle" size={16} color="textBody" />
        <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
          Changing the company name sends it for a quick re-check by the 919 team.
        </Text>
      </View>

      <PhotoSheet visible={sheet === 'logo'} title="Company logo" onClose={() => setSheet(null)} sample={mockImg.madinat} square onPicked={([p]) => p && set({ logo: p })} />
      <SelectSheet visible={sheet === 'industry'} title="Industry" options={INDUSTRIES} value={f.industry} onClose={() => setSheet(null)} onSelect={(v) => (set({ industry: v }), setSheet(null))} />
      <SelectSheet visible={sheet === 'size'} title="Company size" options={SIZES} value={f.size} onClose={() => setSheet(null)} onSelect={(v) => (set({ size: v }), setSheet(null))} />
      <SelectSheet visible={sheet === 'founded'} title="Founded" options={YEARS} value={f.founded} onClose={() => setSheet(null)} onSelect={(v) => (set({ founded: v }), setSheet(null))} />
      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[
          { title: 'POPULAR', items: popularCountryNames },
          { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) },
        ]}
        badge={(x) => countryCode[x] ?? x.slice(0, 2).toUpperCase()}
        value={f.country}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ country: v, city: v === f.country ? f.city : '' }), setSheet(null))}
      />
      <SelectSheet visible={sheet === 'city'} title="City" options={citiesFor(f.country)} value={f.city} onClose={() => setSheet(null)} onSelect={(v) => (set({ city: v }), setSheet(null))} />
    </SubScreen>
  );
}
