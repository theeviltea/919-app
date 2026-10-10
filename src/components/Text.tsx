import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { fontFamily, typeScale, useTheme, type Colors, type Weight } from '@/theme';

type Variant = keyof typeof typeScale | 'title';

type Props = TextProps & {
  variant?: Variant;
  weight?: Weight;
  color?: keyof Colors | (string & {});
  align?: TextStyle['textAlign'];
};

// `title` = Unbounded 19/600 used for sheet and empty-state headings.
const extra = { title: { family: 'display', fontSize: 19, lineHeight: 24, fontWeight: 600 } } as const;

/** Typography from the 919 type scale. Colour accepts a token name or a raw value. */
export function Text({ variant = 'body', weight, color = 'textHeadline', align, style, ...rest }: Props) {
  const { c } = useTheme();
  const t = variant === 'title' ? extra.title : typeScale[variant];
  const w = (weight ?? t.fontWeight) as Weight;
  const col = color in c ? c[color as keyof Colors] : color;
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fontFamily(t.family as 'sans' | 'display', w),
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          color: col,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
