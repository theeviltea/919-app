import { router } from 'expo-router';
import type { ImageSourcePropType } from 'react-native';

import type { Tier } from '@/data/tiers';

export type PhotoSet = { photos: ImageSourcePropType[]; index: number };
export type VideoItem = {
  poster: ImageSourcePropType;
  duration: string;
  /** Top pill, e.g. "Your video presentation". */
  label: string;
  name: string;
  /** Company videos: verified check. */
  verified?: boolean;
  /** Seeker videos: plan badge (TierBadge). */
  tier?: Tier;
  avatar?: ImageSourcePropType;
  subtitle: string;
  text?: string;
  /** The seeker's own presentation: shows Replace instead of contact actions. */
  own?: boolean;
};

// Prototype hand-off between a screen and the full-screen viewers: image sources are not URL-serialisable.
let photos: PhotoSet | null = null;
let video: VideoItem | null = null;

export function openPhotos(set: PhotoSet) {
  photos = set;
  router.push('/viewer/photos');
}
export function openVideo(item: VideoItem) {
  video = item;
  router.push('/viewer/video');
}
export const currentPhotos = () => photos;
export const currentVideo = () => video;
