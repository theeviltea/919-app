import { router } from 'expo-router';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Text } from '@/components';
import { useSignup } from '@/data/signup';
import { useTheme } from '@/theme';

import { VIDEO_POSTER } from './media';
import { pickVideo } from './pickImage';

/** Video presentation: record in the app or pick from the gallery. Result lands in the seeker draft. */
export function VideoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const { setSeeker } = useSignup();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Video presentation" subtitle="A short vertical video where you introduce yourself to employers." closable>
      <View style={{ backgroundColor: c.input, borderRadius: 16, padding: 14, gap: 8 }}>
        {['30–60 seconds, vertical', 'Good light, face the camera', 'Name, experience, languages, when you can work'].map((t) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="check" size={16} color="successText" />
            <Text variant="body" color="textPrimary" style={{ fontSize: 14 }}>
              {t}
            </Text>
          </View>
        ))}
      </View>
      <Button label="Record video" icon="camera" onPress={() => (onClose(), router.push('/signup/video-record'))} />
      <Button
        variant="neutral"
        label="Choose from gallery"
        icon="image"
        onPress={async () => {
          onClose();
          const v = await pickVideo();
          if (v) {
            const sec = Math.round((v.duration ?? 42000) / 1000);
            setSeeker({ video: { poster: VIDEO_POSTER, duration: `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, progress: 0 } });
          }
        }}
      />
    </BottomSheet>
  );
}
