import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { allCountries, citiesFor, countryCode, countryShort, formatDob, popularCountryNames } from '@/data/registration';
import { useSeeker } from '@/data/seeker';
import { useSignup } from '@/data/signup';
import { DateSheet } from '@/features/auth/DateSheet';
import { SelectSheet } from '@/features/auth/SelectSheet';
import { Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Sheet = 'gender' | 'dob' | 'country' | 'city' | null;
const nameErr = (v: string) => (v.trim() && !/^[\p{L}' -]+$/u.test(v.trim()) ? 'Letters only' : undefined);
const emailErr = (v: string) => (v.trim() && !/^\S+@\S+\.\S+$/.test(v.trim()) ? 'Check the email address' : undefined);

/** Personal info: basic data and contacts. Phone changes go through an SMS code. */
export default function Personal() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile, updateProfile } = useSeeker();
  const { setSeeker } = useSignup();
  const initial = { firstName: profile.firstName, lastName: profile.lastName, gender: profile.gender, dob: profile.dob, country: profile.country, city: profile.city, email: profile.email ?? '' };
  const [f, setF] = useState(initial);
  const dirty = (Object.keys(initial) as (keyof typeof initial)[]).some((k) => String(f[k] ?? '') !== String(initial[k] ?? ''));
  const [sheet, setSheet] = useState<Sheet>(null);
  const set = (u: Partial<typeof f>) => setF((x) => ({ ...x, ...u }));
  const cities = citiesFor(f.country);
  const ok = f.firstName.trim() && f.lastName.trim() && !nameErr(f.firstName) && !nameErr(f.lastName) && f.gender && f.dob && f.country && f.city && !emailErr(f.email);

  const save = () => {
    setSeeker({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), gender: f.gender, dob: f.dob, country: f.country, city: f.city });
    updateProfile({ email: f.email.trim() || undefined, emailSource: f.email.trim() === profile.email ? profile.emailSource : undefined });
    toast({ text: 'Changes saved', icon: 'check', aboveTabBar: true });
    router.back();
  };

  return (
    <SubScreen title="Personal info" footer={<Button size="l" label="Save changes" disabled={!ok || !dirty} onPress={save} />}>
      <Panel title="Basic info" gap={8}>
        <Field onSurface label="First name" required value={f.firstName} onChangeText={(v) => set({ firstName: v })} error={nameErr(f.firstName)} autoComplete="given-name" />
        <Field onSurface label="Last name" required value={f.lastName} onChangeText={(v) => set({ lastName: v })} error={nameErr(f.lastName)} autoComplete="family-name" />
        <Field onSurface label="Gender" required value={f.gender} onPress={() => setSheet('gender')} rightIcon="chevron-down" />
        <Field onSurface label="Date of birth" required value={formatDob(f.dob)} onPress={() => setSheet('dob')} rightIcon="calendar" />
        <Field onSurface label="Country" required value={f.country ? (countryShort[f.country] ?? f.country) : undefined} onPress={() => setSheet('country')} rightIcon="chevron-down" />
        <Field onSurface label="City" required value={f.city} placeholder="Select" onPress={() => setSheet('city')} rightIcon="chevron-down" />
      </Panel>

      <Panel title="Contacts" gap={8}>
        {profile.phone ? (
          <View style={{ minHeight: 56, borderRadius: 16, backgroundColor: c.input, paddingVertical: 8, paddingLeft: 16, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="caption" color="textBody">
                  Phone
                </Text>
                <View style={{ height: 18, paddingHorizontal: 6, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Icon name="check" size={11} color="successText" />
                  <Text variant="caption" weight={600} color="successText" style={{ fontSize: 11, lineHeight: 14 }}>
                    Verified
                  </Text>
                </View>
              </View>
              <Text variant="bodyL" weight={600} style={{ marginTop: 2 }}>
                {profile.phone}
              </Text>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/profile/phone', params: { mode: 'change' } })} accessibilityRole="button" accessibilityLabel="Change phone number" style={{ height: 40, paddingHorizontal: 12, justifyContent: 'center' }}>
              <Text variant="body" weight={600} color="link" style={{ fontSize: 14 }}>
                Change
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push({ pathname: '/profile/phone', params: { mode: 'add' } })}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: c.placeholderDashed }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="add" size={20} color="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
                Add phone number
              </Text>
              <Text variant="bodyS" color="textBody" style={{ fontSize: 13 }}>
                Sign in with SMS and let employers call you after you apply
              </Text>
            </View>
          </Pressable>
        )}
        <Field
          onSurface
          label="Email"
          value={f.email}
          onChangeText={(v) => set({ email: v })}
          error={emailErr(f.email)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          right={
            profile.emailSource && f.email === profile.email ? (
              <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="globe" size={12} color="textBody" />
                <Text variant="caption" weight={600}>
                  {profile.emailSource === 'google' ? 'Google' : 'Apple'}
                </Text>
              </View>
            ) : undefined
          }
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Icon name="lock" size={16} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
            Employers see your contacts only after you apply or accept an invite.
          </Text>
        </View>
      </Panel>

      <SelectSheet visible={sheet === 'gender'} title="Gender" options={['Female', 'Male']} value={f.gender} onClose={() => setSheet(null)} onSelect={(v) => (set({ gender: v }), setSheet(null))} />
      <DateSheet visible={sheet === 'dob'} value={f.dob} onClose={() => setSheet(null)} onSelect={(d) => (set({ dob: d }), setSheet(null))} />
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
        onSelect={(v) => (set({ country: v, city: v === f.country ? f.city : undefined }), setSheet(null))}
      />
      <SelectSheet
        visible={sheet === 'city'}
        title="City"
        searchPlaceholder={`Search city in ${f.country ? (countryShort[f.country] ?? f.country) : ''}`}
        sections={[{ title: f.country?.toUpperCase(), items: cities.length ? cities : [`${f.country ?? ''} — other city`] }]}
        value={f.city}
        onClose={() => setSheet(null)}
        onSelect={(v) => (set({ city: v }), setSheet(null))}
      />
    </SubScreen>
  );
}
