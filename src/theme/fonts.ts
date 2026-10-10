import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
} from '@expo-google-fonts/onest';
import { Unbounded_500Medium, Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';

export const fontAssets = {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
};

export type Weight = 400 | 500 | 600 | 700;

/** Custom fonts in RN need one family per weight. */
export function fontFamily(family: 'sans' | 'display', weight: Weight = 400) {
  if (family === 'display') {
    return weight >= 700 ? 'Unbounded_700Bold' : weight >= 600 ? 'Unbounded_600SemiBold' : 'Unbounded_500Medium';
  }
  return { 400: 'Onest_400Regular', 500: 'Onest_500Medium', 600: 'Onest_600SemiBold', 700: 'Onest_700Bold' }[weight];
}
