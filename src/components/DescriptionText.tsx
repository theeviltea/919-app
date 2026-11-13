// Vacancy description with the employer's phone numbers, WhatsApp numbers and emails shown as buttons.
// A tap first opens a short "you're leaving 919" sheet, then the call, WhatsApp or the mail app.
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { parseDescription, type Contact } from '@/lib/contacts';
import { useTheme } from '@/theme';

import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

const ICON = { phone: 'call', whatsapp: 'whatsapp', email: 'mail' } as const;
const GO = { phone: 'Call', whatsapp: 'Open WhatsApp', email: 'Write an email' } as const;
const WHERE = { phone: 'a phone call', whatsapp: 'WhatsApp', email: 'your mail app' } as const;
const LINE = 22;

export function ContactButton({ c, onOpen }: { c: Contact; onOpen: (c: Contact) => void }) {
  const { c: col } = useTheme();
  return (
    <Pressable
      onPress={() => onOpen(c)}
      accessibilityRole="button"
      accessibilityLabel={`${GO[c.kind]} ${c.label}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: col.stroke, backgroundColor: col.surface }}>
      <Icon name={ICON[c.kind]} size={16} color="textPrimary" />
      <Text variant="body" weight={500} color="textPrimary" style={{ fontSize: 15 }} numberOfLines={1}>
        {c.label}
      </Text>
    </Pressable>
  );
}

export function LeaveSheet({ contact, visible, onClose }: { contact: Contact | null; visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const k = contact?.kind ?? 'phone';
  const go = () => {
    const href = contact?.href;
    onClose();
    if (href) Linking.openURL(href).catch(() => undefined);
  };
  return (
    <BottomSheet
      visible={visible && !!contact}
      onClose={onClose}
      title="You're leaving 919"
      subtitle={`This contact was added by the employer. We'll open ${WHERE[k]} — what happens there isn't covered by 919, so keep the talk about the job.`}
      closable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16, borderRadius: 16, backgroundColor: c.input }}>
        <Icon name={ICON[k]} size={20} />
        <Text variant="bodyL" weight={600} style={{ flex: 1 }} numberOfLines={1}>
          {contact?.label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Icon name="shield" size={18} color="successText" />
        <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
          Never pay for a job offer, training or a uniform, and don&apos;t share your passport or card details.
        </Text>
      </View>
      <View style={{ gap: 10, marginTop: 4 }}>
        <Button label={GO[k]} icon={ICON[k]} onPress={go} />
        <Button label="Stay on 919" variant="secondary" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

/** The description as written, line by line, with contacts as secondary buttons in the text colour. `lines` shows it collapsed, as plain text. */
export function DescriptionText({ text, lines }: { text: string; lines?: number }) {
  const [open, setOpen] = useState<Contact | null>(null);
  const [visible, setVisible] = useState(false);
  const show = (c: Contact) => {
    setOpen(c);
    setVisible(true);
  };
  const parsed = parseDescription(text);
  // Collapsed: plain text clipped to whole lines; the buttons appear once it's expanded.
  if (lines)
    return (
      <Text variant="body" color="textPrimary" numberOfLines={lines} style={{ lineHeight: LINE }}>
        {text}
      </Text>
    );
  return (
    <>
      <View style={{ gap: 2 }}>
        {parsed.map((segs, i) => {
          if (segs.length === 0) return <View key={i} style={{ height: 8 }} />;
          if (!segs.some((s) => 'contact' in s))
            return (
              <Text key={i} variant="body" color="textPrimary" style={{ lineHeight: LINE }}>
                {segs.map((s) => ('text' in s ? s.text : '')).join('')}
              </Text>
            );
          return (
            <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 4, paddingVertical: 2 }}>
              {segs.map((s, j) =>
                'contact' in s ? (
                  <ContactButton key={j} c={s.contact} onOpen={show} />
                ) : s.text.trim() ? (
                  <Text key={j} variant="body" color="textPrimary" style={{ lineHeight: LINE, flexShrink: 1 }}>
                    {s.text.trim()}
                  </Text>
                ) : null,
              )}
            </View>
          );
        })}
      </View>
      <LeaveSheet contact={open} visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}
