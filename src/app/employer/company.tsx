import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { allCountries, citiesFor, countryCode, countryShort, popularCountryNames } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

const SAMPLE_LOGO = require('@/assets/images/mock/hostess.jpg');
const looksLikeSite = (s: string) => !s.trim() || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(s.trim());

/** Employer sign-up, step 2 — company card candidates see on every vacancy. Goes to 919 verification. */
export default function CompanyStep() {
  const { c } = useTheme();
  const { employer, setEmployer } = useSignup();
  const co = employer.company;
  const set = (u: Partial<typeof co>) => setEmployer((e) => ({ company: { ...e.company, ...u } }));
  const [sheet, setSheet] = useState<'logo' | 'country' | 'city' | null>(null);
  const ok = !!co.logo && co.name.trim().length > 1 && co.phone.replace(/\D/g, '').length >= 7 && looksLikeSite(co.website) && co.country && co.city;

  return (
    <FormScreen
      top={<StepProgress step={2} of={2} />}
      title="Your company"
      subtitle="Candidates see this on every vacancy you post."
      footer={<Button size="l" label="Send for verification" disabled={!ok} onPress={() => router.push('/employer/review')} />}>
      <Card padding={20} style={{ alignItems: 'center', gap: 6 }}>
        <Pressable onPress={() => setSheet('logo')} accessibilityRole="button" accessibilityLabel={co.logo ? 'Change company logo' : 'Add company logo'}>
          <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {co.logo ? <Image source={co.logo} contentFit="cover" style={{ width: 88, height: 88 }} /> : <Icon name="image" size={30} color="textBody" />}
          </View>
          <View style={{ position: 'absolute', right: -4, bottom: -4, width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, borderWidth: 3, borderColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={16} color="ctaButtonText" />
          </View>
        </Pressable>
        <Text variant="body" weight={700} style={{ marginTop: 8 }}>
          Company logo *
        </Text>
        <Text variant="bodyS" color="textBody">
          Square image, at least 400×400 px
        </Text>
      </Card>
      <View style={{ gap: 8 }}>
        <Field label="Company name" required value={co.name} onChangeText={(v) => set({ name: v })} placeholder="Enter" autoCapitalize="words" />
        <Field label="Contact phone" required value={co.phone} onChangeText={(v) => set({ phone: v })} placeholder="+971 4 000 0000" keyboardType="phone-pad" />
        <Field label="Website" value={co.website} onChangeText={(v) => set({ website: v })} placeholder="company.ae" autoCapitalize="none" keyboardType="url" error={looksLikeSite(co.website) ? undefined : 'Check the address, e.g. skylinehospitality.ae'} />
        <Field label="Country" required value={co.country ? (countryShort[co.country] ?? co.country) : undefined} placeholder="Select" onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field label="City" required value={co.city} placeholder={co.country ? 'Select' : 'Choose a country first'} disabled={!co.country} onPress={() => setSheet('city')} rightIcon="chevron-down" />
      </View>
      <PhotoSheet visible={sheet === 'logo'} title="Company logo" onClose={() => setSheet(null)} sample={SAMPLE_LOGO} square onPicked={([p]) => set({ logo: p })} />
      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[
          { title: 'POPULAR', items: popularCountryNames },
          { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) },
        ]}
        badge={(x) => countryCode[x] ?? x.slice(0, 2).toUpperCase()}
        value={co.country}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ country: v, city: undefined }), setSheet(null))}
      />
      <SelectSheet
        visible={sheet === 'city'}
        title="City"
        searchPlaceholder="Search city"
        sections={[{ title: co.country?.toUpperCase(), items: citiesFor(co.country).length ? citiesFor(co.country) : [`${co.country ?? ''} — other city`] }]}
        value={co.city}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ city: v }), setSheet(null))}
      />
    </FormScreen>
  );
}
