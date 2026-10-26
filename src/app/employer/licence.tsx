import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, FormScreen, Icon, Pressable, StepProgress, Text, useToast } from '@/components';
import { useSignup } from '@/data/signup';
import { Facts, FileCard, LICENCE_FACTS, pickLicence, UploadCard } from '@/features/employer/Licence';
import { useTheme } from '@/theme';

/** Employer sign-up, step 3 (EmpLicence / EmpLicenceAdded) — trade licence PDF for the verified badge. Can be skipped. */
export default function LicenceStep() {
  const { c } = useTheme();
  const toast = useToast();
  const { employer, setEmployer } = useSignup();
  const file = employer.licence;
  const pick = async () => {
    try {
      const f = await pickLicence();
      if (f) setEmployer({ licence: f });
    } catch (e) {
      toast({ text: e instanceof Error ? e.message : 'Couldn’t open the file', icon: 'alert-circle' });
    }
  };
  const next = () => router.push('/employer/review');

  return (
    <FormScreen
      top={<StepProgress step={3} of={3} />}
      title="Trade licence"
      subtitle="Upload your company’s trade licence to get the verified badge. Candidates reply more often to verified employers."
      footer={
        <>
          <Button size="l" label="Send for verification" disabled={!file} onPress={next} />
          <Button size="l" variant="neutral" label="Skip, add it later" onPress={() => (setEmployer({ licence: undefined }), next())} />
        </>
      }>
      {file ? (
        <>
          <FileCard
            file={file}
            meta={`${file.size} · added just now`}
            right={
              <Pressable
                onPress={() => setEmployer({ licence: undefined })}
                accessibilityRole="button"
                accessibilityLabel="Remove file"
                style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={18} color="textBody" />
              </Pressable>
            }
          />
          <View style={{ flexDirection: 'row', gap: 10, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.attentionBack }}>
            <Icon name="alert-circle" size={18} color="attentionText" />
            <Text variant="bodyS" color="attentionText" style={{ flex: 1, lineHeight: 19 }}>
              Check that the licence is valid and issued to {employer.company.name || 'your company'}, otherwise we can’t give the badge.
            </Text>
          </View>
        </>
      ) : (
        <UploadCard onPress={pick} />
      )}
      <Facts items={LICENCE_FACTS} />
    </FormScreen>
  );
}
