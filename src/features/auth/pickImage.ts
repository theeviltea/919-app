import * as ImagePicker from 'expo-image-picker';
import type { ImageSourcePropType } from 'react-native';

/** Opens the photo library. Returns image sources (empty when cancelled). */
export async function pickImages(opts: { multiple?: boolean; limit?: number; square?: boolean } = {}): Promise<ImageSourcePropType[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: !!opts.multiple,
    selectionLimit: opts.limit ?? 0,
    allowsEditing: !opts.multiple,
    aspect: opts.square ? [1, 1] : undefined,
    quality: 0.85,
  });
  if (res.canceled) return [];
  return res.assets.map((a) => ({ uri: a.uri }));
}

export async function pickVideo(): Promise<{ uri: string; duration?: number } | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], videoMaxDuration: 60, quality: 1 });
  if (res.canceled) return null;
  const a = res.assets[0];
  return { uri: a.uri, duration: a.duration ?? undefined };
}
