import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View, type ImageSourcePropType } from 'react-native';

import { Button, FramedAvatar, Icon, Pressable, Text, TierBadge, useToast } from '@/components';
import { mockImg } from '@/data/mock';
import { useSeeker } from '@/data/seeker';
import { frameStops, type FrameStyle } from '@/data/tiers';
import { pickImages } from '@/features/auth/pickImage';
import { Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const FRAMES: (FrameStyle | undefined)[] = [undefined, 'gold', 'ocean', 'neon'];
const label = (f?: FrameStyle) => (f ? f[0].toUpperCase() + f.slice(1) : 'None');

/** SeekProfileLook (Max): custom profile header and a frame around the photo, with a live preview. */
export default function ProfileLook() {
  const { c } = useTheme();
  const toast = useToast();
  const { profile, look, setLook, plan } = useSeeker();
  const [frame, setFrame] = useState<FrameStyle | undefined>(look.frame);
  const [header, setHeader] = useState(look.header);
  const [custom, setCustom] = useState<ImageSourcePropType | null>(null);
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your name';
  const role = profile.occupations.flatMap((o) => o.roles).slice(0, 2).join(' · ');
  const headerSrc = custom ?? mockImg.dubai2;

  if (plan !== 'max') return <Redirect href="/profile/plans" />;

  return (
    <SubScreen
      title="Profile look"
      footer={
        <Button
          size="l"
          label="Save"
          onPress={() => {
            setLook({ frame, header });
            toast({ text: 'Profile look saved', icon: 'check' });
            router.back();
          }}
        />
      }>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
        {header ? <Image source={headerSrc} contentFit="cover" style={{ height: 120 }} /> : <View style={{ height: 88, backgroundColor: c.primarySecondary }} />}
        <View style={{ position: 'absolute', left: 12, top: 12, height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(14,26,43,0.55)', justifyContent: 'center' }}>
          <Text variant="caption" weight={700} color="#FFFFFF">
            Preview
          </Text>
        </View>
        <View style={{ alignItems: 'center', paddingHorizontal: 18, paddingBottom: 18, marginTop: -50 }}>
          <FramedAvatar frame={frame} size={100} ring={4} gap={3} bg={c.surface}>
            {profile.photo ? <Image source={profile.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} /> : <View style={{ flex: 1, backgroundColor: c.avatar3 }} />}
          </FramedAvatar>
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>
              {name}
            </Text>
            <TierBadge tier="max" size={22} />
          </View>
          {role ? (
            <Text variant="body" color="textBody" style={{ marginTop: 4, fontSize: 14 }}>
              {role}
            </Text>
          ) : null}
        </View>
      </View>

      <Panel title="Profile header" gap={12}>
        <Text variant="bodyS" color="textBody" style={{ marginTop: -6, fontSize: 13, lineHeight: 19 }}>
          A wide photo for the top of your profile. At least 1200 × 400 px.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setHeader(true)}
            accessibilityRole="radio"
            accessibilityState={{ checked: header }}
            accessibilityLabel="Your header"
            style={{ flex: 1, height: 84, borderRadius: 16, overflow: 'hidden', borderWidth: header ? 2 : 0, borderColor: c.textHeadline }}>
            <Image source={headerSrc} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            {header ? (
              <View style={{ position: 'absolute', right: 6, bottom: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={12} color="ctaButtonText" />
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={async () => {
              const [img] = await pickImages();
              if (img) {
                setCustom(img);
                setHeader(true);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Upload header"
            style={{ flex: 1, height: 84, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.placeholderDashed, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icon name="download" size={20} color="link" />
            <Text variant="bodyS" weight={700} color="link" style={{ fontSize: 13 }}>
              Upload
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setHeader(false)}
            accessibilityRole="radio"
            accessibilityState={{ checked: !header }}
            accessibilityLabel="Default header"
            style={{ flex: 1, height: 84, borderRadius: 16, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center', borderWidth: header ? 0 : 2, borderColor: c.textHeadline }}>
            <Text variant="bodyS" weight={600} color="textBody" style={{ fontSize: 13 }}>
              Default
            </Text>
          </Pressable>
        </View>
      </Panel>

      <Panel title="Frame" gap={12}>
        <Text variant="bodyS" color="textBody" style={{ marginTop: -6, fontSize: 13, lineHeight: 19 }}>
          Shows around your photo in your profile, search and People.
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {FRAMES.map((f) => {
            const on = f === frame;
            return (
              <Pressable key={label(f)} onPress={() => setFrame(f)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${label(f)} frame`} style={{ alignItems: 'center', gap: 6 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, padding: 2, borderWidth: 2, borderColor: on ? c.textHeadline : 'transparent' }}>
                  <FramedAvatar frame={f} size={56} ring={5} gap={2} bg={c.surface}>
                    {profile.photo ? <Image source={profile.photo} contentFit="cover" contentPosition={{ top: '25%' }} style={{ width: '100%', height: '100%' }} /> : <View style={{ flex: 1, backgroundColor: f ? frameStops[f][1] : c.input }} />}
                  </FramedAvatar>
                </View>
                <Text variant="bodyS" weight={on ? 700 : 500} color={on ? 'textHeadline' : 'textBody'} style={{ fontSize: 13 }}>
                  {label(f)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>
    </SubScreen>
  );
}
