import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { allCountries, citiesFor, countryCode, countryShort, formatDob, popularCountryNames } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { DateSheet } from '@/features/auth/DateSheet';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useTheme } from '@/theme';

const lettersOnly = (s: string) => /^[\p{L}\s'-]*$/u.test(s);
const SAMPLE = require('@/assets/images/mock/people/p1.jpg');
type Sheet = 'gender' | 'dob' | 'country' | 'city' | 'photo' | null;

/** Seeker sign-up, step 1 of 5 — About you. Social sign-up arrives prefilled. */
export default function About() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ social?: 'apple' | 'google'; edit?: string }>();
  const edit = !!params.edit;
  const social = params.social;
  const { seeker: s, setSeeker } = useSignup();
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    if (social && !s.firstName) setSeeker({ photo: SAMPLE, firstName: 'Mia', lastName: 'Colsen' });
  }, [social]); // eslint-disable-line react-hooks/exhaustive-deps

  const err = (v: string) => (v && !lettersOnly(v) ? 'Use letters only, without symbols' : undefined);
  const cities = citiesFor(s.country);
  const ok = !!s.photo && s.firstName.trim() && s.lastName.trim() && !err(s.firstName) && !err(s.lastName) && s.gender && s.dob && s.country && s.city;

  return (
    <FormScreen
      top={edit ? undefined : <StepProgress step={1} of={5} />}
      title={edit ? 'Personal details' : 'About you'}
      subtitle="Employers see this first. Fields marked * are required."
      footer={<Button size="l" label={edit ? 'Save' : 'Continue'} disabled={!ok} onPress={() => (edit ? router.back() : router.push('/signup/occupation'))} />}>
      {social ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: c.successBack }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} color="successText" style={{ fontSize: 14 }}>
              Connected with {social === 'apple' ? 'Apple' : 'Google'}
            </Text>
            <Text variant="caption" weight={400} color="textBody" numberOfLines={1}>
              mia.colsen@gmail.com · name filled in for you
            </Text>
          </View>
          <Icon name="verified" size={22} color="successText" />
        </View>
      ) : null}

      <Card padding={20} style={{ alignItems: 'center', gap: 6 }}>
        <Pressable onPress={() => setSheet('photo')} accessibilityRole="button" accessibilityLabel={s.photo ? 'Change profile photo' : 'Add profile photo'}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {s.photo ? <Image source={s.photo} contentFit="cover" style={{ width: 88, height: 88 }} /> : <Icon name="camera" size={30} color="textBody" />}
          </View>
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, borderWidth: 3, borderColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={16} color="ctaButtonText" />
          </View>
        </Pressable>
        <Text variant="body" weight={700} style={{ marginTop: 8 }}>
          Profile photo *
        </Text>
        <Text variant="bodyS" color="textBody" align="center">
          {s.photo ? 'Tap the camera to change it' : 'A clear, well-lit photo with your face visible'}
        </Text>
      </Card>

      <View style={{ gap: 8 }}>
        <Field label="First name" required value={s.firstName} onChangeText={(v) => setSeeker({ firstName: v })} placeholder="Enter" autoComplete="given-name" error={err(s.firstName)} />
        <Field label="Last name" required value={s.lastName} onChangeText={(v) => setSeeker({ lastName: v })} placeholder="Enter" autoComplete="family-name" error={err(s.lastName)} />
        <Field label="Gender" required value={s.gender} placeholder="Select" onPress={() => setSheet('gender')} rightIcon="chevron-down" />
        <Field label="Date of birth" required value={formatDob(s.dob)} placeholder="Select" onPress={() => setSheet('dob')} rightIcon="calendar" />
        <Field label="Country" required value={s.country ? (countryShort[s.country] ?? s.country) : undefined} placeholder="Select" onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field label="City" required value={s.city} placeholder={s.country ? 'Select' : 'Choose a country first'} disabled={!s.country} onPress={() => setSheet('city')} rightIcon="chevron-down" />
      </View>

      <PhotoSheet visible={sheet === 'photo'} title="Profile photo" onClose={() => setSheet(null)} sample={SAMPLE} square onPicked={([p]) => setSeeker({ photo: p })} />
      <SelectSheet visible={sheet === 'gender'} title="Gender" options={['Female', 'Male']} value={s.gender} onClose={() => setSheet(null)} onSelect={(v) => (setSeeker({ gender: v }), setSheet(null))} />
      <DateSheet visible={sheet === 'dob'} value={s.dob} onClose={() => setSheet(null)} onSelect={(d) => (setSeeker({ dob: d }), setSheet(null))} />
      <SelectSheet
        visible={sheet === 'country'}
        title="Country"
        searchPlaceholder="Search country"
        sections={[
          { title: 'POPULAR', items: popularCountryNames },
          { title: 'ALL COUNTRIES', items: allCountries.filter((x) => !popularCountryNames.includes(x)) },
        ]}
        badge={(x) => countryCode[x] ?? x.slice(0, 2).toUpperCase()}
        value={s.country}
        onClose={() => setSheet(null)}
        onSelect={(v) => (setSeeker({ country: v, city: undefined }), setSheet(null))}
      />
      <SelectSheet
        visible={sheet === 'city'}
        title="City"
        searchPlaceholder={`Search city in ${s.country ? (countryShort[s.country] ?? s.country) : ''}`}
        sections={[{ title: s.country?.toUpperCase(), items: cities.length ? cities : [`${s.country ?? ''} — other city`] }]}
        value={s.city}
        onClose={() => setSheet(null)}
        onSelect={(v) => (setSeeker({ city: v }), setSheet(null))}
      />
    </FormScreen>
  );
}
