import { useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';

import { Icon, Text } from '@/components';
import { Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

type Doc = { title: string; intro: string; sections: [string, string[]][] };

const DOCS: Record<'privacy' | 'terms', Doc> = {
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains which data 919 collects from job seekers, why we need it and how you can control it.',
    sections: [
      ['Data we collect', ['Account data: your name, phone number, email, date of birth and city.', 'Profile data: photos, video presentation, measurements, experience, education and links you add.', 'Activity: vacancies you view, save and apply to, and messages you send in 919.']],
      ['How we use it', ['To show your profile to employers, match you with vacancies, deliver messages and notifications, and keep the service safe from fraud.']],
      ['What employers see', ['Employers see your public profile in talent search unless you hide it in Edit profile. Your phone and email are shared only after you apply or accept an invite.']],
      ['Sharing with third parties', ['We do not sell personal data. We share it only with providers that run 919 for us — hosting, SMS delivery and analytics — under contracts that protect it, and with authorities when the law requires.']],
      ['Storage and security', ['Data is stored on servers in the UAE and encrypted in transit and at rest. We keep it while your account is active and up to 12 months after deletion for legal reasons.']],
      ['Your rights', ['You can view, correct or download your data and delete your account at any time. Write to us and we will reply within 30 days.']],
    ],
  },
  terms: {
    title: 'User agreement',
    intro: 'These terms apply when you use 919 to find work. By creating an account you agree to them.',
    sections: [
      ['Your account', ['You must be 18 or older. One person — one account. Keep your sign-in code private; actions from your account are considered yours.']],
      ['Your profile', ['Photos, video and details must be yours, recent and truthful. No nudity, no contacts in photos, no misleading information. We may hide content that breaks these rules.']],
      ['Applications and chats', ['Be respectful to employers. Don’t send spam, requests for payment or links to other services in messages. Report anything suspicious from the chat menu.']],
      ['Payments', ['Applying to vacancies is free. Premium features are paid in advance for the selected period and renew until you cancel.']],
      ['Blocking and termination', ['We may limit or block an account that breaks these terms. You can delete your account at any time in Settings.']],
      ['Liability', ['919 connects job seekers and employers. Terms of a job are agreed between you and the employer; we check companies but are not a party to the work agreement.']],
    ],
  },
};

/** User agreement / Privacy policy. */
export default function Legal() {
  const { doc = 'privacy' } = useLocalSearchParams<{ doc?: 'privacy' | 'terms' }>();
  const { c } = useTheme();
  const d = DOCS[doc] ?? DOCS.privacy;
  return (
    <SubScreen title={d.title}>
      <Panel gap={14}>
        <View style={{ alignSelf: 'flex-start', height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="calendar" size={14} color="textBody" />
          <Text variant="caption" weight={600} color="textBody">
            Updated 1 October 2026
          </Text>
        </View>
        <Text variant="bodyL" style={{ lineHeight: 24 }}>
          {d.intro}
        </Text>
        {d.sections.map(([h, ps], i) => (
          <View key={h} style={{ gap: 8, marginTop: 6 }}>
            <Text variant="bodyL" weight={700} accessibilityRole="header">
              {i + 1}. {h}
            </Text>
            {ps.map((t) => (
              <Text key={t} variant="body" color="textBody" style={{ fontSize: 14, lineHeight: 22 }}>
                {t}
              </Text>
            ))}
          </View>
        ))}
      </Panel>
      <Text variant="body" color="textBody" style={{ fontSize: 14, paddingHorizontal: 4, paddingBottom: 16 }}>
        Questions about this document? Write to{' '}
        <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }} onPress={() => Linking.openURL('mailto:legal@919.ae')} accessibilityRole="link">
          legal@919.ae
        </Text>
      </Text>
    </SubScreen>
  );
}
