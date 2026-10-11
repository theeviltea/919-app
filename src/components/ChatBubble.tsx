import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Quote = { author: string; text: string };

type Props = {
  mine?: boolean;
  text?: string;
  time: string;
  quote?: Quote;
  /** Photo / video tiles rendered by the caller (grid, contact card). */
  attachment?: React.ReactNode;
};

/** ChatBubble — incoming `surface` 20/20/20/6, outgoing `primary` 20/20/6/20, max 78%. */
export function ChatBubble({ mine, text, time, quote, attachment }: Props) {
  const { c } = useTheme();
  const fg = mine ? 'ctaButtonText' : 'textHeadline';
  const media = !!attachment;
  const inline = !!text && !media && !quote && text.length <= 24 && !text.includes('\n');
  const meta = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: inline ? 1 : 0 }}>
      <Text variant="caption" weight={400} style={{ fontSize: 11, lineHeight: 14 }} color={mine ? 'rgba(255,255,255,0.8)' : 'textLightSecondary'}>
        {time}
      </Text>
      {mine ? <Icon name="check-double" size={14} color="rgba(255,255,255,0.8)" /> : null}
    </View>
  );
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: media ? 250 : '78%',
        width: media ? 250 : undefined,
        backgroundColor: mine ? c.primary : c.surface,
        borderRadius: 20,
        borderBottomRightRadius: mine ? 6 : 20,
        borderBottomLeftRadius: mine ? 20 : 6,
        paddingTop: media ? 4 : 10,
        paddingHorizontal: media ? 4 : 14,
        paddingBottom: 8,
        boxShadow: mine ? undefined : '0 1px 2px rgba(14,26,43,0.06)',
      }}>
      {quote ? (
        <View
          style={{
            marginHorizontal: -6,
            marginTop: -2,
            marginBottom: 6,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 12,
            borderLeftWidth: 3,
            borderLeftColor: mine ? '#FFFFFF' : c.primary,
            backgroundColor: mine ? c.bubbleQuote : c.surfaceInset,
          }}>
          <Text variant="caption" weight={700} color={fg}>
            {quote.author}
          </Text>
          <Text variant="bodyS" color={fg} numberOfLines={1} style={{ opacity: 0.9 }}>
            {quote.text}
          </Text>
        </View>
      ) : null}
      {attachment}
      {inline ? (
        // Short one-liners ("OK", "Thanks!"): time sits on the same line, like in Telegram / WhatsApp.
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <Text variant="body" color={fg} style={{ lineHeight: 21, flexShrink: 1 }}>
            {text}
          </Text>
          {meta}
        </View>
      ) : (
        <>
          {text ? (
            <Text variant="body" color={fg} style={{ paddingHorizontal: media ? 10 : 0, paddingTop: media ? 8 : 0, lineHeight: 21 }}>
              {text}
            </Text>
          ) : null}
          <View style={{ alignSelf: 'flex-end', marginTop: 2, paddingHorizontal: media ? 10 : 0 }}>{meta}</View>
        </>
      )}
    </View>
  );
}

/** Centered system line: "You accepted the request". */
export function ChatSystemLine({ text, time, tone = 'success', icon }: { text: string; time?: string; tone?: 'success' | 'danger'; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.surface, boxShadow: '0 1px 2px rgba(14,26,43,0.06)' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: tone === 'success' ? c.successBack : c.dangerBack }}>
        <Icon name={icon ?? (tone === 'success' ? 'check' : 'cancel')} size={14} color={tone === 'success' ? 'successText' : 'dangerText'} />
      </View>
      <Text variant="body" weight={600} style={{ fontSize: 14 }}>
        {text}
      </Text>
      {time ? (
        <Text variant="caption" weight={400} color="textLightSecondary" style={{ fontSize: 11 }}>
          {time}
        </Text>
      ) : null}
    </View>
  );
}

export function ChatDate({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ alignSelf: 'center', height: 28, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.surfacePanel, justifyContent: 'center' }}>
      <Text variant="caption" weight={600} color="textBody">
        {label}
      </Text>
    </View>
  );
}
