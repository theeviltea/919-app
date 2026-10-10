import { SvgXml } from 'react-native-svg';

import { icons, type IconName } from '@/icons/icons';
import { useTheme, type Colors } from '@/theme';

type Props = { name: IconName; size?: number; color?: keyof Colors | (string & {}) };

export function Icon({ name, size = 24, color = 'textHeadline' }: Props) {
  const { c } = useTheme();
  const col = color in c ? c[color as keyof Colors] : color;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${icons[name]}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={col} />;
}

export type { IconName };
