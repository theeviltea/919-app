import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon, Row, Text, useToast } from '@/components';
import { companyCompleteness, useEmployer } from '@/data/employer';
import { mockImg } from '@/data/mock';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { LogoTile } from '@/features/hire/LogoTile';
import { Completeness, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

/** Employer — Edit profile hub (EmpEditHub): logo, completeness, three sections and verification. */
export default function EmployerEditHub() {
  const { c } = useTheme();
  const toast = useToast();
  const { info, rep, setInfo } = useEmployer();
  const [photo, setPhoto] = useState(false);
  const percent = companyCompleteness(info, rep);
  const missing = !info.linkedin.trim() ? 'Add a LinkedIn page to reach 100%' : !info.instagram.trim() ? 'Add Instagram to reach 100%' : percent < 100 ? 'Fill in the empty fields to reach 100%' : 'Your company profile is complete';

  return (
    <SubScreen title="Edit profile">
      <Panel style={{ alignItems: 'stretch', gap: 14 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <LogoTile info={info} size={104} onPress={() => setPhoto(true)} />
          <View style={{ alignItems: 'center', gap: 2, marginTop: 4 }}>
            <Text variant="title" align="center" style={{ fontSize: 19 }}>
              {info.name}
            </Text>
            <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
              {info.industry} · {info.city}
            </Text>
          </View>
        </View>
        <Completeness label="Company profile" percent={percent} hint={missing} />
      </Panel>

      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <Row icon="user" title="Your profile" subtitle="Name, position, photo, contacts" onPress={() => router.push('/company/profile')} />
        <Row icon="building" title="Company details" subtitle="Name, logo, industry, about" onPress={() => router.push('/company/details')} />
        <Row icon="globe" title="Contacts and links" subtitle="Phone, email, office, website, social" onPress={() => router.push('/company/links')} last />
      </View>

      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <Row
          icon="verified"
          tone="success"
          title="Verification"
          subtitle="Verified on 12 Sep 2026"
          chevron
          right={
            <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="verified" size={14} color="successText" />
              <Text variant="caption" weight={700} color="successText">
                Verified
              </Text>
            </View>
          }
          onPress={() => toast({ text: 'Your company was verified by the 919 team on 12 Sep 2026', icon: 'verified' })}
          last
        />
      </View>

      <PhotoSheet visible={photo} title="Company logo" onClose={() => setPhoto(false)} sample={mockImg.madinat} square onPicked={([p]) => (setInfo({ logo: p }), toast({ text: 'Logo updated', icon: 'check' }))} />
    </SubScreen>
  );
}
