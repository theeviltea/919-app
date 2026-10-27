import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, Pressable, Text, Toggle, useToast, type IconName } from '@/components';
import { SLOTS, slotLabels, slotsLabel, statsLine, toggleSlot, untilLabel, type Slot } from '@/data/availability';
import { useSeeker } from '@/data/seeker';
import { useTheme } from '@/theme';

/** The flash on light surfaces (tabs, links): the yellow darkened for contrast on light, the brand yellow on dark. */
export function useFlashColor() {
  const { scheme, c } = useTheme();
  return scheme === 'dark' ? c.urgent : '#E0A800';
}

/** Yellow square with the flash icon — the mark of Available today everywhere in the app. */
export function FlashTile({ size = 40, muted }: { size?: number; muted?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: muted ? c.input : c.urgent, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="flash" size={Math.round(size * 0.5)} color={muted ? 'textBody' : 'onUrgent'} />
    </View>
  );
}

/** "Today · Evening" on a candidate photo (TalentAvailable, search results). */
export function TodayPill({ when }: { when: string }) {
  const { c } = useTheme();
  return (
    <View style={{ position: 'absolute', left: 8, bottom: 8, zIndex: 4, height: 24, paddingLeft: 6, paddingRight: 8, borderRadius: 999, backgroundColor: c.urgent, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Icon name="flash" size={13} color="onUrgent" />
      <Text variant="caption" weight={700} color="onUrgent" numberOfLines={1} style={{ fontSize: 12 }}>
        Today · {when}
      </Text>
    </View>
  );
}

/**
 * SeekAvailOff / SeekAvailOn card (feed and profile). Off: tap opens the sheet. On: yellow card with the end time and
 * how many employers looked; the switch turns it off at once.
 */
export function AvailCard({ onOpen }: { onOpen?: () => void }) {
  const { c } = useTheme();
  const toast = useToast();
  const { avail, availEligible, setAvailSheet, turnOffAvail } = useSeeker();
  if (!availEligible) return null;
  if (!avail.on)
    return (
      <Pressable
        onPress={() => setAvailSheet(true)}
        accessibilityRole="button"
        accessibilityLabel="Available today. Show employers you can start work today"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20, backgroundColor: c.surface }}>
        <FlashTile />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            Available today
          </Text>
          <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 17 }}>
            Show employers you can start work today
          </Text>
        </View>
        <Toggle value={false} onValueChange={() => setAvailSheet(true)} accessibilityLabel="Available today" />
      </Pressable>
    );
  return (
    <Pressable
      onPress={onOpen}
      disabled={!onOpen}
      accessibilityRole={onOpen ? 'button' : undefined}
      style={{ gap: 10, padding: 14, borderRadius: 20, backgroundColor: c.attentionBack }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <FlashTile />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body" weight={700} style={{ fontSize: 15 }}>
            You’re available today
          </Text>
          <Text variant="bodyS" color="attentionText" style={{ marginTop: 2, fontSize: 13 }}>
            {slotsLabel(avail.slots)} · {untilLabel(avail.until)}
          </Text>
        </View>
        <Toggle
          value
          onValueChange={() => {
            turnOffAvail();
            toast({ text: 'Available today is off. Employers no longer see you in the Today tab', icon: 'flash' });
          }}
          accessibilityLabel="Available today"
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="view" size={16} color="attentionText" />
        <Text variant="bodyS" color="attentionText" style={{ flex: 1, fontSize: 13 }}>
          {statsLine(avail)}
        </Text>
      </View>
    </Pressable>
  );
}

function Point({ icon, children }: { icon: IconName; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color="textHeadline" />
      </View>
      <Text variant="body" color="textPrimary" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
        {children}
      </Text>
    </View>
  );
}

function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="body" weight={700} style={{ fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** SeekAvailSheet — what turning it on means, when you can work, and the safety note. */
function TurnOnSheet() {
  const { c } = useTheme();
  const toast = useToast();
  const { availSheet, setAvailSheet, turnOnAvail } = useSeeker();
  const [slots, setSlots] = useState<Slot[]>(['any']);
  const close = () => setAvailSheet(false);
  return (
    <BottomSheet visible={availSheet} onClose={close}>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <FlashTile size={72} />
        <Text variant="title" align="center" style={{ marginTop: 16 }}>
          Available today
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
          Turn it on when you can start work today — a one-time shift or an event.
        </Text>
      </View>
      <View>
        <Point icon="users">
          You appear in the{' '}
          <Text variant="body" weight={700} style={{ fontSize: 14 }}>
            Available today
          </Text>{' '}
          tab for employers
        </Point>
        <Point icon="verified">Only verified companies can message you from there</Point>
        <Point icon="clock">It turns off by itself in 24 hours</Point>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="body" weight={700} style={{ fontSize: 14 }}>
          When can you work?
        </Text>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SLOTS.map((s) => {
            const on = slots.includes(s);
            return (
              <Pressable
                key={s}
                onPress={() => setSlots((x) => toggleSlot(x, s))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: on ? 0 : 1, borderColor: c.stroke, backgroundColor: on ? c.inverse : c.surface, justifyContent: 'center' }}>
                <Text variant="bodyS" weight={600} color={on ? 'onInverse' : 'textHeadline'} style={{ fontSize: 13 }}>
                  {slotLabels[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.input }}>
        <Icon name="lock" size={18} color="textBody" />
        <Text variant="bodyS" color="textPrimary" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
          919 never asks you to pay for a job. Keep talks and payments in 919 chat and report anyone who asks otherwise.
        </Text>
      </View>
      <View style={{ gap: 2 }}>
        <Button
          size="l"
          icon="flash"
          label="Turn on for 24 hours"
          onPress={() => {
            turnOnAvail(slots);
            close();
            toast({ text: 'You’re available today. Employers see you in the Today tab', icon: 'flash' });
          }}
        />
        <TextButton label="Not now" onPress={close} />
      </View>
    </BottomSheet>
  );
}

/** SeekAvailEnded — after the 24 hours: what happened and a shortcut to turn it on again. */
function EndedSheet() {
  const { c } = useTheme();
  const { availEnded, closeAvailEnded, setAvailSheet } = useSeeker();
  const stats = availEnded ?? { views: 0, messages: 0, invites: 0 };
  const cells: [number, string][] = [
    [stats.views, stats.views === 1 ? 'employer viewed you' : 'employers viewed you'],
    [stats.messages, stats.messages === 1 ? 'message' : 'messages'],
    [stats.invites, stats.invites === 1 ? 'invite' : 'invites'],
  ];
  return (
    <BottomSheet visible={!!availEnded} onClose={closeAvailEnded}>
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <FlashTile size={72} muted />
        <Text variant="title" align="center" style={{ marginTop: 16 }}>
          Your 24 hours are over
        </Text>
        <Text variant="body" color="textBody" align="center" style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
          Available today turned off. Here’s how it went:
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {cells.map(([v, k]) => (
          <View key={k} style={{ flex: 1, borderRadius: 16, backgroundColor: c.input, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' }}>
            <Text variant="displayM" style={{ fontSize: 22, lineHeight: 28 }}>
              {v}
            </Text>
            <Text variant="caption" color="textBody" align="center" style={{ marginTop: 4, fontSize: 12 }}>
              {k}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="body" color="textPrimary" align="center" style={{ fontSize: 14, lineHeight: 21 }}>
        Free again? Turn it on whenever you can start the same day.
      </Text>
      <View style={{ gap: 2 }}>
        <Button
          size="l"
          icon="flash"
          label="Turn on again"
          onPress={() => {
            closeAvailEnded();
            setAvailSheet(true);
          }}
        />
        <TextButton label="Close" onPress={closeAvailEnded} />
      </View>
    </BottomSheet>
  );
}

/** Both sheets live once in the seeker tabs, so the feed, the profile and notifications share them. */
export function AvailSheets() {
  const { availSheet } = useSeeker();
  return (
    <>
      {/* Fresh state (Any time) every time the sheet opens. */}
      <TurnOnSheet key={String(availSheet)} />
      <EndedSheet />
    </>
  );
}
