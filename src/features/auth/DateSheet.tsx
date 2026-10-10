import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Icon, IconButton, Pressable, Text } from '@/components';
import { ageFrom } from '@/data/registration';
import { useTheme } from '@/theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Date of birth — month calendar with month / year jump. Minimum age 18. */
type Props = { visible: boolean; value?: Date; onClose: () => void; onSelect: (d: Date) => void };

export function DateSheet(props: Props) {
  return (
    <BottomSheet visible={props.visible} onClose={props.onClose} title="Date of birth" closable>
      {/* Remounts on every open, so the calendar starts from the current value. */}
      {props.visible ? <Calendar {...props} /> : null}
    </BottomSheet>
  );
}

function Calendar({ value, onClose, onSelect }: Props) {
  const { c } = useTheme();
  const initial = value ?? new Date(new Date().getFullYear() - 25, 9, 12);
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const [sel, setSel] = useState<Date | undefined>(value);
  const [yearMode, setYearMode] = useState(false);

  const maxYear = new Date().getFullYear() - 18;
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const prevDays = new Date(view.y, view.m, 0).getDate();
  const cells: { d: number; cur: boolean }[] = [];
  for (let i = lead - 1; i >= 0; i--) cells.push({ d: prevDays - i, cur: false });
  for (let d = 1; d <= days; d++) cells.push({ d, cur: true });
  while (cells.length % 7) cells.push({ d: cells.length - lead - days + 1, cur: false });
  const shift = (n: number) => setView((v) => ({ y: v.y + Math.floor((v.m + n) / 12), m: (v.m + n + 12) % 12 }));
  const age = ageFrom(sel);
  const tooYoung = age !== undefined && age < 18;

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton icon="arrow-left" label="Previous month" tone="filled" size={40} onPress={() => shift(-1)} />
        <Pressable onPress={() => setYearMode(!yearMode)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }}>
          <Text variant="bodyL" weight={700}>
            {MONTHS[view.m]} {view.y}
          </Text>
          <Icon name="chevron-down" size={16} color="textBody" />
        </Pressable>
        <IconButton icon="arrow-right" label="Next month" tone="filled" size={40} onPress={() => shift(1)} />
      </View>
      {yearMode ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxHeight: 290, overflow: 'hidden' }}>
          {Array.from({ length: 20 }, (_, i) => maxYear - i).map((y) => (
            <Pressable
              key={y}
              onPress={() => (setView((v) => ({ ...v, y })), setYearMode(false))}
              style={{ width: '22.5%', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: y === view.y ? c.primary : c.input }}>
              <Text variant="body" weight={600} color={y === view.y ? 'ctaButtonText' : 'textHeadline'}>
                {y}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: 'row' }}>
            {DOW.map((d) => (
              <Text key={d} variant="caption" color="textBody" align="center" style={{ flex: 1 }}>
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
            {cells.map((cell, i) => {
              const on = cell.cur && sel && sel.getFullYear() === view.y && sel.getMonth() === view.m && sel.getDate() === cell.d;
              const weekend = i % 7 >= 5;
              return (
                <Pressable
                  key={i}
                  disabled={!cell.cur}
                  onPress={() => setSel(new Date(view.y, view.m, cell.d))}
                  accessibilityLabel={cell.cur ? `${cell.d} ${MONTHS[view.m]} ${view.y}` : undefined}
                  style={{ width: `${100 / 7}%`, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent' }}>
                    <Text variant="body" weight={on ? 700 : 600} color={on ? 'ctaButtonText' : !cell.cur ? 'textLightSecondary' : weekend ? 'textBody' : 'textHeadline'}>
                      {cell.d}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
      {sel ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: tooYoung ? c.dangerBack : c.input }}>
          <Icon name="calendar" size={16} color={tooYoung ? 'dangerText' : 'textBody'} />
          <Text variant="bodyS" color={tooYoung ? 'dangerText' : 'textBody'} style={{ flex: 1 }}>
            {tooYoung ? 'You must be at least 18 to use 919' : 'Selected: '}
            {tooYoung ? null : (
              <Text variant="bodyS" weight={700}>
                {sel.getDate()} {MONTHS[sel.getMonth()]} {sel.getFullYear()}
              </Text>
            )}
          </Text>
          {!tooYoung ? (
            <Text variant="bodyS" color="textBody">
              {age} years
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button variant="secondary" label="Cancel" onPress={onClose} style={{ flex: 1 }} />
        <Button label="Select" disabled={!sel || tooYoung} onPress={() => sel && onSelect(sel)} style={{ flex: 1 }} />
      </View>
    </>
  );
}
