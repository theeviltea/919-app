import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { BottomSheet } from './BottomSheet';
import { BrandMark, Button } from './Button';
import { Text } from './Text';

export type AuthMethod = 'phone' | 'apple' | 'google' | 'email';

/** Phone / Apple / Google / email stack — shared by AuthSheet, SignInMethods and RegPhone. */
export function AuthButtons({ onMethod, verb = 'Sign in' }: { onMethod: (m: AuthMethod) => void; verb?: string }) {
  return (
    <View style={{ gap: 12 }}>
      <Button label={`${verb} with phone`} icon="phone" onPress={() => onMethod('phone')} />
      <Button variant="secondary" label={`${verb} with Apple`} leading={<BrandMark brand="apple" />} onPress={() => onMethod('apple')} />
      <Button variant="secondary" label={`${verb} with Google`} leading={<BrandMark brand="google" />} onPress={() => onMethod('google')} />
      <Button variant="secondary" label={`${verb} with email`} icon="mail" onPress={() => onMethod('email')} />
    </View>
  );
}

export function OrDivider({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.stroke }} />
      <Text variant="bodyS" weight={500} color="textBody">
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.stroke }} />
    </View>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  /** Mini card of the object the guest tapped (vacancy). */
  context?: ReactNode;
  /** Role the new account gets: vacancies → job seeker, profiles → employer. */
  role: 'seeker' | 'employer';
  onMethod: (m: AuthMethod) => void;
  onCreateAccount: () => void;
};

/** AuthSheet — guest sign-in on key actions (Respond, save, open a profile). No counts. */
export function AuthSheet({ visible, onClose, title, subtitle, context, role, onMethod, onCreateAccount }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={subtitle} closable>
      {context}
      <AuthButtons onMethod={onMethod} />
      <OrDivider label="New to 919?" />
      <Button variant="tonal" label="Create account" onPress={onCreateAccount} />
      <Text variant="caption" weight={400} color="textBody" align="center">
        The account will be created as{' '}
        <Text variant="caption" weight={700}>
          {role === 'seeker' ? 'a job seeker' : 'an employer'}
        </Text>
      </Text>
    </BottomSheet>
  );
}
