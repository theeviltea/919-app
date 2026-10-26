import * as DocumentPicker from 'expo-document-picker';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, Pressable, Text, type IconName } from '@/components';
import { useEmployer, type LicenceFile } from '@/data/employer';
import { LogoTile } from '@/features/hire/LogoTile';
import { useTheme, type Colors } from '@/theme';

const MAX_BYTES = 10 * 1024 * 1024;
const formatSize = (b?: number) => (!b ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** Opens the system file picker for a PDF. Returns null when cancelled; throws a readable message when the file doesn't fit. */
export async function pickLicence(): Promise<LicenceFile | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
  if (r.canceled || !r.assets?.length) return null;
  const a = r.assets[0];
  if (a.mimeType && a.mimeType !== 'application/pdf' && !a.name.toLowerCase().endsWith('.pdf')) throw new Error('Choose a PDF file');
  if (a.size && a.size > MAX_BYTES) throw new Error('The file is larger than 10 MB');
  return { name: a.name, size: formatSize(a.size) || 'PDF', uri: a.uri };
}

/** Dashed drop zone: "Upload trade licence · PDF, up to 10 MB". */
export function UploadCard({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Upload trade licence, PDF up to 10 MB"
      style={{ borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: c.placeholderDashed, backgroundColor: c.surface, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center', gap: 10 }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.primarySecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="file" size={26} color="primary" />
      </View>
      <Text variant="body" weight={700} style={{ fontSize: 16 }}>
        Upload trade licence
      </Text>
      <Text variant="bodyS" color="textBody">
        PDF, up to 10 MB
      </Text>
    </Pressable>
  );
}

/** The picked PDF: red PDF tile, name, meta and a trailing control. */
export function FileCard({ file, meta, right, dim }: { file: LicenceFile; meta: string; right?: ReactNode; dim?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: dim ? 0.6 : 1 }}>
      <View style={{ width: 48, height: 56, borderRadius: 12, backgroundColor: c.dangerBack, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Icon name="file" size={22} color="dangerText" />
        <Text variant="caption" weight={700} color="dangerText" style={{ fontSize: 10 }}>
          PDF
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={600} numberOfLines={1} style={{ fontSize: 15 }}>
          {file.name}
        </Text>
        <Text variant="bodyS" color="textBody" style={{ marginTop: 3 }}>
          {meta}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** List of short facts with an icon each (who sees the file, timing, what the badge does). */
export function Facts({ items }: { items: [IconName, string][] }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 }}>
      {items.map(([icon, text], i) => (
        <View key={text} style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderColor: c.divider }}>
          <Icon name={icon} size={20} color="primary" />
          <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Round status icon: check / clock / alert. */
export function StatusDot({ icon, bg, fg, size = 28 }: { icon: IconName; bg: keyof Colors; fg: keyof Colors; size?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c[bg], alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={Math.round(size / 2)} color={fg} />
    </View>
  );
}

export const LICENCE_FACTS: [IconName, string][] = [
  ['lock', 'Only the 919 team sees this file. Candidates never do.'],
  ['clock', 'We check it within 24 hours.'],
  ['verified', 'After the check, the badge appears next to your company name on vacancies, the company page and in chats.'],
];

/** How the company looks to candidates, with or without the badge. */
export function BadgePreview() {
  const { c } = useTheme();
  const { info } = useEmployer();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: c.back }}>
      <LogoTile info={info} size={40} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15, flexShrink: 1 }}>
            {info.name}
          </Text>
          <Icon name="verified" size={16} color="primary" />
        </View>
        <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2 }}>
          Hostess, rooftop lounge · AED 15 000
        </Text>
      </View>
    </View>
  );
}

