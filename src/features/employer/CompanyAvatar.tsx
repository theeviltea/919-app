import { View } from 'react-native';

import { Logo, Text } from '@/components';
import type { Company } from '@/data/registration';
import { useTheme } from '@/theme';

/** Company tile with initials; the 919 team shows the brand logo. */
export function CompanyAvatar({ company, size = 44 }: { company: Pick<Company, 'initials' | 'tint'>; size?: number }) {
  const { c } = useTheme();
  const bg =
    company.tint === 'brand' ? c.primary : company.tint === 'dark' ? c.textHeadline : [c.avatar1, c.avatar2, c.avatar3, c.avatar4, c.avatar5][company.tint - 1];
  const fg = company.tint === 'brand' ? '#FFFFFF' : company.tint === 'dark' ? c.surface : '#18191C';
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {company.tint === 'brand' ? (
        <Logo height={size * 0.36} />
      ) : (
        <Text variant="displayM" color={fg} style={{ fontSize: size * 0.3, lineHeight: size * 0.38 }}>
          {company.initials}
        </Text>
      )}
    </View>
  );
}
