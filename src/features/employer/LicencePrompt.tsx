import { router } from 'expo-router';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { useSession } from '@/data/session';
import { useTheme } from '@/theme';

import { BadgePreview, pickLicence } from './Licence';

/** EmpLicenceSheet: once after sign-up without a trade licence — why to add it, upload or later. */
export function LicencePromptSheet() {
  const { c } = useTheme();
  const toast = useToast();
  const { user } = useSession();
  const { needsLicence, licence, licencePromptSeen, setLicencePromptSeen, sendLicence } = useEmployer();
  const visible = user?.role === 'employer' && needsLicence && licence.status === 'none' && !licencePromptSeen;
  const upload = async () => {
    try {
      const f = await pickLicence();
      if (!f) return;
      setLicencePromptSeen();
      sendLicence(f);
      toast({ text: 'Trade licence sent. We’ll check it within 24 hours', icon: 'check' });
    } catch (e) {
      toast({ text: e instanceof Error ? e.message : 'Couldn’t open the file', icon: 'alert-circle' });
    }
  };
  return (
    <BottomSheet visible={visible} onClose={setLicencePromptSeen} closable>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="verified" size={34} color="primary" />
        </View>
        <Text variant="title" align="center" style={{ marginTop: 16 }}>
          Add your trade licence
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
          Attach the licence to get the verified badge. Candidates trust verified companies more and reply to them faster.
        </Text>
      </View>
      <BadgePreview />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
        <Icon name="lock" size={16} color="textBody" />
        <Text variant="bodyS" color="textBody">
          Only the 919 team sees the file
        </Text>
      </View>
      <View style={{ gap: 2 }}>
        <Button size="l" label="Upload trade licence" onPress={upload} />
        <Pressable onPress={setLicencePromptSeen} accessibilityRole="button" style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Later
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

/** Small banner on the Company tab while the company has no approved licence. Tap → Verification. */
export function LicenceAlert() {
  const { c } = useTheme();
  const { needsLicence, licence } = useEmployer();
  if (!needsLicence) return null;
  const rejected = licence.status === 'rejected';
  return (
    <Pressable
      onPress={() => router.push('/company/verification')}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.surface }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: rejected ? c.dangerBack : c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={rejected ? 'alert-circle' : 'verified'} size={20} color={rejected ? 'dangerText' : 'primary'} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={700} style={{ fontSize: 14 }}>
          {rejected ? 'Licence wasn’t accepted' : 'Get the verified badge'}
        </Text>
        <Text variant="bodyS" color="textBody" style={{ marginTop: 2, lineHeight: 18 }}>
          {rejected ? 'Upload a new trade licence to get the badge' : 'Attach your trade licence so candidates trust you more'}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color="textLightSecondary" />
    </Pressable>
  );
}
