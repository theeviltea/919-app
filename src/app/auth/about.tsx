import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Field, FormScreen, Icon, Pressable, StepProgress, Text } from '@/components';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { useTheme } from '@/theme';

const lettersOnly = (s: string) => /^[\p{L}\s'-]*$/u.test(s);
const cities: Record<string, string[]> = {
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam'],
  Qatar: ['Doha'],
};
type Sheet = 'gender' | 'country' | 'city' | null;

/** Seeker sign-up, step 1 of 5 — About you. Social sign-up arrives prefilled. */
export default function About() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ social?: 'apple' | 'google'; phone?: string; email?: string }>();
  const social = params.social;
  const finish = useFinishAuth();
  const [photo, setPhoto] = useState<number | null>(social ? require('@/assets/images/mock/people/p1.jpg') : null);
  const [first, setFirst] = useState(social ? 'Mia' : '');
  const [last, setLast] = useState(social ? 'Colsen' : '');
  const [gender, setGender] = useState<string>();
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState<string>();
  const [city, setCity] = useState<string>();
  const [sheet, setSheet] = useState<Sheet>(null);

  const lastErr = last && !lettersOnly(last) ? 'Use letters only, without symbols' : undefined;
  const firstErr = first && !lettersOnly(first) ? 'Use letters only, without symbols' : undefined;
  const dobOk = /^\d{2}\.\d{2}\.\d{4}$/.test(dob);
  const ok = !!photo && first && last && !lastErr && !firstErr && gender && dobOk && country && city;

  return (
    <FormScreen
      top={<StepProgress step={1} of={5} />}
      title="About you"
      subtitle="Employers see this first. Fields marked * are required."
      footer={<Button size="l" label="Continue" disabled={!ok} onPress={() => finish({ role: 'seeker', firstName: first, phone: params.phone, email: params.email })} />}>
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
        <Pressable onPress={() => setPhoto(photo ? null : require('@/assets/images/mock/people/p1.jpg'))} accessibilityRole="button" accessibilityLabel={photo ? 'Change profile photo' : 'Add profile photo'}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {photo ? <Image source={photo} contentFit="cover" style={{ width: 88, height: 88 }} /> : <Icon name="camera" size={30} color="textBody" />}
          </View>
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, borderWidth: 3, borderColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={16} color="ctaButtonText" />
          </View>
        </Pressable>
        <Text variant="body" weight={700} style={{ marginTop: 8 }}>
          Profile photo *
        </Text>
        <Text variant="bodyS" color="textBody" align="center">
          {photo ? 'Tap the camera to change it' : 'A clear, well-lit photo with your face visible'}
        </Text>
      </Card>

      <View style={{ gap: 8 }}>
        <Field label="First name" required value={first} onChangeText={setFirst} placeholder="Enter" autoComplete="given-name" error={firstErr} />
        <Field label="Last name" required value={last} onChangeText={setLast} placeholder="Enter" autoComplete="family-name" error={lastErr} />
        <Field label="Gender" required value={gender} placeholder="Select" onPress={() => setSheet('gender')} rightIcon="chevron-down" />
        <Field
          label="Date of birth"
          required
          value={dob}
          onChangeText={(t) => {
            const d = t.replace(/\D/g, '').slice(0, 8);
            setDob([d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('.'));
          }}
          placeholder="DD.MM.YYYY"
          keyboardType="number-pad"
          rightIcon="calendar"
        />
        <Field label="Country" required value={country} placeholder="Select" onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field
          label="City"
          required
          value={city}
          placeholder={country ? 'Select' : 'Choose a country first'}
          disabled={!country}
          onPress={() => setSheet('city')}
          rightIcon="chevron-down"
        />
      </View>

      <SelectSheet visible={sheet === 'gender'} title="Gender" options={['Female', 'Male']} value={gender} onClose={() => setSheet(null)} onSelect={(v) => (setGender(v), setSheet(null))} />
      <SelectSheet visible={sheet === 'country'} title="Country" options={Object.keys(cities)} value={country} onClose={() => setSheet(null)} onSelect={(v) => (setCountry(v), setCity(undefined), setSheet(null))} />
      <SelectSheet visible={sheet === 'city'} title="City" options={country ? cities[country] : []} value={city} onClose={() => setSheet(null)} onSelect={(v) => (setCity(v), setSheet(null))} />
    </FormScreen>
  );
}
