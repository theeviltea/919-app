import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, Row, Text } from '@/components';
import { useEmployer } from '@/data/employer';
import { Pill } from '@/features/hire/ui';
import { useTheme } from '@/theme';

/** "Verification" row (Edit profile and Settings): trade licence status → Verification screen. Hidden for private recruiters. */
export function VerificationRow({ last }: { last?: boolean }) {
  const { c } = useTheme();
  const { licence } = useEmployer();
  const st = licence.status;
  if (licence.exempt) return null;
  return (
    <Row
      icon="verified"
      tone={st === 'verified' ? 'success' : st === 'review' ? 'brand' : 'neutral'}
      title="Verification"
      subtitle={
        st === 'verified'
          ? `Trade licence · verified ${licence.checkedAt ?? ''}`
          : st === 'review'
            ? 'Trade licence on review'
            : st === 'rejected'
              ? 'Licence wasn’t accepted, upload a new one'
              : 'Add trade licence to get the badge'
      }
      chevron
      right={
        st === 'verified' ? (
          <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="verified" size={14} color="successText" />
            <Text variant="caption" weight={700} color="successText">
              Verified
            </Text>
          </View>
        ) : (
          <Pill
            label={st === 'review' ? 'On review' : st === 'rejected' ? 'Rejected' : 'Not verified'}
            bg={st === 'review' ? c.primarySecondary : st === 'rejected' ? c.dangerBack : c.input}
            fg={st === 'review' ? c.link : st === 'rejected' ? c.dangerText : c.textBody}
            h={26}
          />
        )
      }
      onPress={() => router.push('/company/verification')}
      last={last}
    />
  );
}
