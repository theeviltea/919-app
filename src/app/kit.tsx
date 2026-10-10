import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AuthSheet,
  BannerItem,
  BottomSheet,
  Button,
  Card,
  ChatBubble,
  ChatDate,
  ChatSystemLine,
  Chip,
  EmptyState,
  Field,
  OTPField,
  ResendTimer,
  Row,
  RowGroup,
  SearchBar,
  SegmentedTabs,
  Skeleton,
  StatusBanner,
  StatusChip,
  Text,
  Toggle,
  useToast,
} from '@/components';
import { useTheme, type SchemePreference } from '@/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="caption" weight={700} color="textBody" style={{ textTransform: 'uppercase', letterSpacing: 0.7 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Component kit — every 919 DS component in both themes. Dev-only screen. */
export default function Kit() {
  const { c, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [name, setName] = useState('Mia');
  const [last, setLast] = useState('Co!$#%');
  const [otp, setOtp] = useState('7892');
  const [tab, setTab] = useState<'new' | 'accepted' | 'declined'>('accepted');
  const [chip, setChip] = useState('All');
  const [on, setOn] = useState(true);
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(false);
  const [auth, setAuth] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.back }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 120, gap: 28, maxWidth: 520, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: 12 }}>
        <Text variant="displayXl">919 · Kit</Text>
        <SegmentedTabs<SchemePreference>
          items={[
            { key: 'system', label: 'System' },
            { key: 'light', label: 'Light' },
            { key: 'dark', label: 'Dark' },
          ]}
          value={preference}
          onChange={setPreference}
        />
      </View>

      <Section title="Buttons">
        <Button size="l" label="Continue" onPress={() => toast({ text: 'Vacancy sent for review' })} />
        <Button size="l" label="Continue" disabled />
        <Button label="Post a vacancy" icon="add" />
        <Button variant="secondary" label="Clear search" icon="cancel" />
        <Button variant="tonal" label="Create account" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button size="s" variant="neutral" label="Decline" icon="cancel" style={{ flex: 1 }} />
          <Button size="s" label="Accept" icon="check" style={{ flex: 1 }} />
        </View>
        <Button variant="premium" label="Boost with Premium" icon="star" />
        <Button variant="danger" label="Log out of other devices" icon="logout" />
      </Section>

      <Section title="Field">
        <Field label="First name" required value={name} onChangeText={setName} placeholder="Enter" />
        <Field label="Last name" required value={last} onChangeText={setLast} error="Use letters only, without symbols" />
        <Field label="City" required value="Dubai" onPress={() => setSheet(true)} rightIcon="chevron-down" />
        <Field label="End" value="Present" onPress={() => {}} rightIcon="calendar" disabled />
        <Card padding={16} style={{ gap: 8 }}>
          <Field onSurface label="About" required multiline maxLength={500} counter value="Hostess with 4 years in five-star hotels, fluent in English and Arabic." onChangeText={() => {}} />
        </Card>
      </Section>

      <Section title="OTP">
        <OTPField value={otp} onChange={setOtp} autoFocus={false} />
        <ResendTimer seconds={53} onResend={() => {}} />
        <OTPField value="789205" onChange={() => {}} autoFocus={false} error="Incorrect code. 2 attempts left" />
      </Section>

      <Section title="Search">
        <View style={{ backgroundColor: c.primary, borderRadius: 24, padding: 16 }}>
          <SearchBar value={q} onChangeText={setQ} placeholder="Name, role or skill" onFilterPress={() => {}} />
        </View>
      </Section>

      <Section title="Chips">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['All', 'Urgent', 'Hospitality', 'Events'].map((l) => (
            <Chip key={l} label={l} selected={chip === l} onPress={() => setChip(l)} icon={l === 'Urgent' ? 'fire' : undefined} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <StatusChip kind="success" label="Active" />
          <StatusChip kind="success" label="Accepted" icon="check" />
          <StatusChip kind="pending" label="On review" />
          <StatusChip kind="attention" label="Changes needed" />
          <StatusChip kind="danger" label="Rejected" />
          <StatusChip kind="urgent" label="Urgent" />
          <StatusChip kind="premium" label="Premium" />
          <StatusChip kind="new" label="New" />
          <StatusChip kind="count" label="5 new" />
        </View>
      </Section>

      <Section title="Tabs & rows">
        <SegmentedTabs
          items={[
            { key: 'new', label: 'New', count: 5 },
            { key: 'accepted', label: 'Accepted', count: 3 },
            { key: 'declined', label: 'Declined', count: 2 },
          ]}
          value={tab}
          onChange={setTab}
        />
        <RowGroup title="Account">
          <Row icon="notification" title="New applicants" subtitle="As soon as someone applies" right={<Toggle value={on} onValueChange={setOn} accessibilityLabel="New applicants" />} />
          <Row icon="lock" title="Privacy and security" onPress={() => {}} />
          <Row icon="logout" title="Log out" danger last onPress={() => {}} />
        </RowGroup>
      </Section>

      <Section title="Status banners">
        <StatusBanner kind="attention" title="Changes needed" subtitle="The 919 team reviewed your vacancy · today, 11:40">
          <View>
            <BannerItem n={1} text="Replace the cover photo — it shows a different venue." />
            <BannerItem n={2} text="Add working hours and days to the description." />
          </View>
          <Button label="Edit and resubmit" />
        </StatusBanner>
        <StatusBanner kind="danger" title="Vacancy rejected" subtitle="Violates 919 rules · can’t be published" />
        <StatusBanner kind="info" title="Add a video presentation" subtitle="This employer asks for one before the first call" />
      </Section>

      <Section title="Chat">
        <View style={{ backgroundColor: c.back, gap: 8 }}>
          <ChatDate label="Today" />
          <ChatBubble text="Can you also tell us your availability next week?" time="10:12" />
          <ChatBubble mine quote={{ author: 'Omar Haddad', text: 'Can you also tell us your availability next week?' }} text="Friday works, Saturday after 6 pm" time="10:15" />
          <ChatSystemLine text="You accepted the request" time="17:40" />
        </View>
      </Section>

      <Section title="Skeleton">
        <Card style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={84} height={84} radius={14} strong />
          <View style={{ flex: 1, gap: 8, paddingTop: 2 }}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="45%" height={12} />
            <View style={{ flex: 1 }} />
            <Skeleton width="55%" height={16} />
          </View>
        </Card>
      </Section>

      <Section title="Empty state">
        <EmptyState icon="briefcase" title="No vacancies yet" text="Post your first vacancy — candidates usually start applying the same day." action={{ label: 'Post a vacancy', icon: 'add', onPress: () => {} }} />
      </Section>

      <Section title="Sheets & toasts">
        <Button variant="secondary" label="Open bottom sheet" onPress={() => setSheet(true)} />
        <Button variant="secondary" label="Open guest auth sheet" onPress={() => setAuth(true)} />
        <Button variant="secondary" label="Paid toast" onPress={() => toast({ text: 'Urgent is on for 24 hours', kind: 'paid' })} />
      </Section>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Close vacancy?" subtitle="The vacancy stops receiving applicants and moves to Closed.">
        <Field onSurface label="Reason" value="Hired through 919" onPress={() => {}} rightIcon="chevron-down" />
        <Button label="Close vacancy" onPress={() => setSheet(false)} />
        <Button variant="neutral" label="Cancel" onPress={() => setSheet(false)} />
      </BottomSheet>
      <AuthSheet
        visible={auth}
        onClose={() => setAuth(false)}
        title="Sign in to apply"
        subtitle="Your application goes out right after you sign in."
        role="seeker"
        onMethod={() => setAuth(false)}
        onCreateAccount={() => setAuth(false)}
      />
    </ScrollView>
  );
}
