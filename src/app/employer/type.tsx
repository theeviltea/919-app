import { router } from 'expo-router';
import { View } from 'react-native';

import { FormScreen, Icon, Pressable, Text, type IconName } from '@/components';
import { useSignup, type EmployerMode } from '@/data/signup';
import { useTheme } from '@/theme';

function Option({ icon, title, text, primary, onPress }: { icon: IconName; title: string; text: string; primary?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={{ flexDirection: 'row', gap: 12, padding: primary ? 16 : 14, alignItems: primary ? 'flex-start' : 'center' }}>
      <View style={{ width: primary ? 44 : 36, height: primary ? 44 : 36, borderRadius: 12, backgroundColor: primary ? c.primarySecondary : c.input, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={primary ? 22 : 18} color={primary ? 'primary' : 'textBody'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyL" weight={700} style={primary ? { fontSize: 17 } : undefined}>
          {title}
        </Text>
        <Text variant="bodyS" color="textBody" style={{ marginTop: 3, lineHeight: 18 }}>
          {text}
        </Text>
      </View>
      {primary ? (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-right" size={18} color="primary" />
        </View>
      ) : (
        <Icon name="chevron-right" size={18} color="textBody" />
      )}
    </Pressable>
  );
}

/** Employer sign-up — account type: own company, join an existing one, or private recruiter. */
export default function EmployerType() {
  const { c } = useTheme();
  const { setEmployer } = useSignup();
  const go = (mode: EmployerMode) => {
    setEmployer({ mode });
    router.push('/employer/rep');
  };
  return (
    <FormScreen
      title="How will you hire?"
      subtitle="Choose the account that fits. You can invite teammates later."
      footer={
        <Pressable onPress={() => router.replace('/auth/sign-in')} accessibilityRole="link" style={{ alignSelf: 'center', paddingVertical: 6 }}>
          <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
            Already have an account?{' '}
            <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
              Sign in
            </Text>
          </Text>
        </Pressable>
      }>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, boxShadow: '0 2px 8px rgba(14,26,43,0.08)' }}>
        <Option primary icon="building" title="Register a company" text="Create the company profile, post vacancies and add your team." onPress={() => go('company')} />
        <View style={{ height: 1, backgroundColor: c.divider, marginHorizontal: 16 }} />
        <Option icon="users" title="Join my company" text="I'm a representative of a company that's already on 919" onPress={() => go('join')} />
      </View>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, boxShadow: '0 2px 8px rgba(14,26,43,0.08)' }}>
        <Option primary icon="user" title="Private recruiter" text="Post vacancies and search for candidates on your own, without a company." onPress={() => go('private')} />
      </View>
    </FormScreen>
  );
}
