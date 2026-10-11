import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon, Pressable, Row, Text, Toggle, useToast } from '@/components';
import { completeness, useSeeker } from '@/data/seeker';
import { useSignup } from '@/data/signup';
import { SAMPLE_PHOTOS } from '@/features/auth/media';
import { PhotoSheet } from '@/features/auth/PhotoSheet';
import { Completeness, Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

/** Edit profile hub: photo, completeness, three sections and visibility in talent search. */
export default function EditHub() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile: p, hidden, setHidden } = useSeeker();
  const { setSeeker } = useSignup();
  const [photoSheet, setPhotoSheet] = useState(false);
  const comp = completeness(p);
  const roles = p.occupations.flatMap((o) => o.roles.slice(0, 1));

  return (
    <SubScreen title="Edit profile">
      <Panel>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => setPhotoSheet(true)} accessibilityRole="button" accessibilityLabel="Change profile photo">
            {p.photo ? (
              <Image source={p.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: c.avatar1 }} />
            ) : (
              <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="user" size={40} color="textLightSecondary" />
              </View>
            )}
            <View style={{ position: 'absolute', right: -2, bottom: -2, width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: c.surface, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text variant="title">{`${p.firstName} ${p.lastName}`.trim() || 'Your name'}</Text>
            <Text variant="body" color="textBody" style={{ marginTop: 4, fontSize: 14 }}>
              {[...roles, p.city].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>
        <Completeness percent={comp.percent} hint={comp.next ? `${comp.next.hint} to reach ${comp.nextPercent}%` : 'Your profile is complete'} />
      </Panel>

      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <Row icon="user" title="Personal info" subtitle="Name, gender, age, contacts" onPress={() => router.push('/profile/personal')} />
        <Row icon="camera" title="General" subtitle="Photos, video, about, languages" onPress={() => router.push('/profile/general')} />
        <Row icon="briefcase" title="Professional" subtitle="Occupations, experience, education, links" onPress={() => router.push('/profile/professional')} last />
      </View>

      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <Row
          icon="view"
          tone="success"
          title="Visible to employers"
          subtitle="Show my profile in talent search"
          right={<Toggle value={!hidden} onValueChange={(v) => setHidden(!v)} accessibilityLabel="Visible to employers" />}
          last
        />
      </View>

      <PhotoSheet
        visible={photoSheet}
        title="Profile photo"
        square
        sample={SAMPLE_PHOTOS[0]}
        onClose={() => setPhotoSheet(false)}
        onPicked={(s) => {
          setPhotoSheet(false);
          if (s[0]) {
            setSeeker({ photo: s[0] });
            toast({ text: 'Profile photo updated', icon: 'check', aboveTabBar: true });
          }
        }}
      />
    </SubScreen>
  );
}
