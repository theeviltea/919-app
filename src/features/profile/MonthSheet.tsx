import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomSheet, Button, Icon, IconButton, Pressable, Text } from '@/components';
import { MONTHS, fmtYM, nowYM, type YM } from '@/data/seeker';
import { useTheme } from '@/theme';

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const before = (a: YM, b: YM) => a.y < b.y || (a.y === b.y && a.m < b.m);

type Props = { visible: boolean; title: string; value?: YM; min?: YM; onClose: () => void; onSelect: (v: YM) => void };

/** Work period picker: year chips + month grid; "Pick an exact day" switches to a calendar. Future months are off. */
export function MonthSheet(props: Props) {
  const [day, setDay] = useState(false);
  const close = () => (setDay(false), props.onClose());
  return (
    <BottomSheet visible={props.visible} onClose={close} title={day ? props.title.replace('month', 'date') : props.title} closable>
      {props.visible ? <Body {...props} day={day} setDay={setDay} onClose={close} onSelect={(v) => (setDay(false), props.onSelect(v))} /> : null}
    </BottomSheet>
  );
}

function Body({ value, min, onClose, onSelect, day, setDay }: Props & { day: boolean; setDay: (v: boolean) => void }) {
  const { c } = useTheme();
  const now = nowYM();
  const [y, setY] = useState(value?.y ?? now.y);
  const [m, setM] = useState(value?.m ?? now.m);
  const years = Array.from({ length: 30 }, (_, i) => now.y - 29 + i);
  const yearsRef = useRef<ScrollView>(null);
  const off = (v: YM) => before(now, v) || (min ? before(v, min) : false);

  if (day) {
    const first = new Date(y, m, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    const shift = (n: number) => {
      const t = y * 12 + m + n;
      setY(Math.floor(t / 12));
      setM(t % 12);
    };
    const today = new Date();
    return (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton icon="chevron-left" label="Previous month" tone="filled" size={40} onPress={() => shift(-1)} />
          <Pressable onPress={() => setDay(false)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }}>
            <Text variant="bodyL" weight={600}>
              {MONTHS[m]} {y}
            </Text>
            <Icon name="chevron-down" size={16} color="textBody" />
          </Pressable>
          <IconButton icon="chevron-right" label="Next month" tone="filled" size={40} onPress={() => shift(1)} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {DOW.map((d) => (
            <Text key={d} variant="caption" weight={600} color="textLightSecondary" align="center" style={{ width: `${100 / 7}%`, paddingVertical: 6 }}>
              {d}
            </Text>
          ))}
          {cells.map((d, i) => {
            const sel = d && value?.y === y && value?.m === m && value?.d === d;
            const future = d ? new Date(y, m, d) > today : false;
            const weekend = i % 7 >= 5;
            return (
              <View key={i} style={{ width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                {d ? (
                  <Pressable
                    onPress={() => onSelect({ y, m, d })}
                    disabled={future || off({ y, m })}
                    accessibilityRole="button"
                    accessibilityLabel={`${d} ${MONTHS[m]} ${y}`}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? c.primary : 'transparent' }}>
                    <Text variant="body" weight={sel ? 700 : 600} color={sel ? 'ctaButtonText' : future ? 'textLightSecondary' : weekend ? 'textBody' : 'textHeadline'}>
                      {d}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
        {value?.d ? (
          <View style={{ height: 42, borderRadius: 14, backgroundColor: c.input, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 }}>
            <Icon name="calendar" size={16} color="textBody" />
            <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
              Selected:{' '}
              <Text variant="body" weight={700} style={{ fontSize: 14 }}>
                {fmtYM(value)}
              </Text>
            </Text>
          </View>
        ) : null}
        <Button variant="secondary" label="Cancel" onPress={onClose} style={{ alignSelf: 'flex-start', paddingHorizontal: 44 }} />
      </>
    );
  }

  return (
    <>
      <ScrollView
        ref={yearsRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        onContentSizeChange={() => yearsRef.current?.scrollTo({ x: Math.max(0, (years.indexOf(y) - 2) * 72), animated: false })}>
        {years.map((yy) => {
          const on = yy === y;
          return (
            <Pressable
              key={yy}
              onPress={() => setY(yy)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: on ? 0 : 1, borderColor: c.stroke, backgroundColor: on ? c.inverse : c.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {on ? <Icon name="check" size={14} color="onInverse" /> : null}
              <Text variant="body" weight={600} color={on ? 'onInverse' : 'textHeadline'} style={{ fontSize: 14 }}>
                {yy}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
        {MONTHS.map((name, i) => {
          const v = { y, m: i };
          const disabled = off(v);
          const on = value?.y === y && value?.m === i;
          return (
            <View key={name} style={{ width: '33.333%', padding: 4 }}>
              <Pressable
                onPress={() => onSelect(v)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${name} ${y}`}
                style={{ height: 52, borderRadius: 14, backgroundColor: on ? c.primary : c.input, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}>
                <Text variant="body" weight={600} color={on ? 'ctaButtonText' : 'textHeadline'}>
                  {name.slice(0, 3)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Pressable onPress={() => (setM(value?.m ?? m), setDay(true))} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}>
        <Icon name="calendar" size={16} color="link" />
        <Text variant="body" weight={700} color="link" style={{ fontSize: 14 }}>
          Pick an exact day
        </Text>
      </Pressable>
      <Button variant="secondary" label="Cancel" onPress={onClose} style={{ alignSelf: 'flex-start', paddingHorizontal: 44 }} />
    </>
  );
}
