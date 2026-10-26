import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, FormScreen, Icon, Text } from '@/components';
import { useEmployer } from '@/data/employer';
import { useSignup } from '@/data/signup';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { VerificationSteps } from '@/features/employer/Steps';
import { useTheme } from '@/theme';

/** Employer sign-up done — company (or private recruiter) sent to the 919 team for verification. */
export default function EmployerReview() {
  const { c } = useTheme();
  const { mode } = useLocalSearchParams<{ mode?: 'private' }>();
  const { employer } = useSignup();
  const finish = useFinishAuth();
  const { resetLicence } = useEmployer();
  const isPrivate = mode === 'private';
  const licence = isPrivate ? undefined : employer.licence;
  const done = () => {
    resetLicence(licence);
    finish({
      role: 'employer',
      firstName: employer.firstName,
      company: { name: isPrivate ? `${employer.firstName} ${employer.lastName}`.trim() : employer.company.name, status: 'pending' },
    });
  };

  return (
    <FormScreen
      hideBack
      footer={
        <>
          <Button size="l" label="Browse talent" onPress={done} />
          <Button size="l" variant="secondary" icon="add" label="Create a vacancy" onPress={done} />
        </>
      }>
      <View style={{ gap: 18, marginTop: 24 }}>
        <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="verified" size={40} color="primary" />
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="displayL" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 29 }}>
            {isPrivate ? 'Profile sent for verification' : 'Company sent for verification'}
          </Text>
          <Text variant="body" color="textPrimary" style={{ lineHeight: 22 }}>
            {licence
              ? 'We check your company and trade licence so candidates can trust every vacancy on 919. You’ll get a notification as soon as it’s done, and the verified badge appears on your profile.'
              : 'We check business details so candidates can trust every vacancy on 919. You’ll get a notification as soon as it’s done.'}
          </Text>
        </View>
        <VerificationSteps
          steps={[
            { label: 'Account created', done: true },
            { label: isPrivate ? 'Recruiter details sent' : 'Company details sent', done: true },
            ...(licence ? [{ label: 'Trade licence sent', done: true }] : []),
            { label: 'Verification by the 919 team', done: false },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Icon name="sparkles" size={20} color="primary" />
          <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14 }}>
            You can already browse talent and prepare your first vacancy while we check.
          </Text>
        </View>
      </View>
    </FormScreen>
  );
}
