import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { logoXml, patternTileXml } from '@/icons/brand';
import { useTheme } from '@/theme';

/** 919 logo — white only, on brand blue. Proportions 525×290. */
export function Logo({ height = 24 }: { height?: number }) {
  return <SvgXml xml={logoXml} height={height} width={(height * 525) / 290} color="#FFFFFF" accessibilityLabel="919" />;
}

/** Vector brand pattern (splash, DS cover): tile 375×467.424 repeated vertically, shapes on #3F94FF. */
export function VectorPattern({ width, height }: { width: number; height: number }) {
  const { c } = useTheme();
  const tileH = (width * 467.424) / 375;
  const n = Math.ceil(height / tileH);
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden', backgroundColor: '#3F94FF' }}>
      {Array.from({ length: n }, (_, i) => (
        <SvgXml key={i} xml={patternTileXml} width={width} height={tileH} color={c.primary} />
      ))}
    </View>
  );
}

/** Blue header with the 3D pattern at 50% (main screens, guest zone). Radius 32 at the bottom. */
export function PatternHeader({ children, style, radius = 32 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.primary, borderBottomLeftRadius: radius, borderBottomRightRadius: radius, overflow: 'hidden' }, style]}>
      <Image
        source={require('@/assets/images/pattern-3d.jpg')}
        contentFit="cover"
        contentPosition="top"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.5 }}
        accessibilityElementsHidden
      />
      {children}
    </View>
  );
}
