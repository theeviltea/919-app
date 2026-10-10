import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, FormScreen, Icon, Pressable, SearchBar, StepProgress, Text, type IconName } from '@/components';
import { companies, type Company } from '@/data/registration';
import { useSignup } from '@/data/signup';
import { useFinishAuth } from '@/features/auth/useFinishAuth';
import { CompanyAvatar } from '@/features/employer/CompanyAvatar';
import { useTheme, type Colors } from '@/theme';

type Stage = 'pick' | 'sent' | 'approved' | 'declined';

function Pair({ company, icon, tone }: { company: Company; icon: IconName; tone: [keyof Colors, keyof Colors] }) {
  const { c } = useTheme();
  const { employer } = useSignup();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: c.avatar1, alignItems: 'center', justifyContent: 'center' }}>
        {employer.photo ? <Image source={employer.photo} contentFit="cover" style={{ width: 64, height: 64 }} /> : <Icon name="user" size={30} color="#B44A12" />}
      </View>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c[tone[0]], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={tone[1]} />
      </View>
      <CompanyAvatar company={company} size={64} />
    </View>
  );
}

/**
 * Join an existing company — pick it, send a request, its admin confirms.
 * Prototype: LEO'V declines, every other company approves 2 s after the request.
 */
export default function JoinCompany() {
  const { c } = useTheme();
  const { employer, setEmployer } = useSignup();
  const finish = useFinishAuth();
  const [q, setQ] = useState('');
  const [stage, setStage] = useState<Stage>('pick');
  const sel = companies.find((x) => x.id === employer.joinCompanyId);
  const list = companies.filter((x) => !q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase()));

  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!waiting || !sel) return;
    const t = setTimeout(() => {
      setWaiting(false);
      setStage(sel.declines ? 'declined' : 'approved');
    }, 2000);
    return () => clearTimeout(t);
  }, [waiting, sel]);

  const closeSent = () => {
    setStage('pick');
    setWaiting(true);
  };

  return (
    <FormScreen
      top={<StepProgress step={2} of={2} />}
      title="Find your company"
      subtitle="Pick the company you recruit for. Its admin will confirm you."
      footer={<Button size="l" label={waiting ? 'Waiting for the answer…' : 'Send request'} loading={waiting} disabled={!sel || waiting} onPress={() => setStage('sent')} />}>
      <SearchBar variant="page" value={q} onChangeText={setQ} placeholder="Company name" />
      <View style={{ backgroundColor: c.surface, borderRadius: 20, overflow: 'hidden' }}>
        {list.map((co, i) => {
          const on = co.id === employer.joinCompanyId;
          return (
            <Pressable
              key={co.id}
              onPress={() => setEmployer({ joinCompanyId: co.id })}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderTopWidth: i && !on ? 1 : 0,
                borderColor: c.divider,
                backgroundColor: on ? c.primarySecondary : 'transparent',
                borderRadius: on ? 18 : 0,
                borderWidth: on ? 2 : 0,
                ...(on ? { borderColor: c.primary } : {}),
              }}>
              <CompanyAvatar company={co} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={700}>
                  {co.name}
                </Text>
                <Text variant="bodyS" color="textBody">
                  {co.city}
                </Text>
              </View>
              {on ? (
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={14} color="ctaButtonText" />
                </View>
              ) : (
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.control }} />
              )}
            </Pressable>
          );
        })}
        {list.length === 0 ? (
          <View style={{ padding: 16, gap: 10 }}>
            <Text variant="body" color="textBody">
              No company called “{q}” on 919 yet.
            </Text>
            <Button variant="tonal" label="Register a company instead" onPress={() => (setEmployer({ mode: 'company' }), router.replace('/employer/company'))} />
          </View>
        ) : null}
      </View>

      {sel ? (
        <>
          <BottomSheet visible={stage === 'sent'} onClose={closeSent}>
            <View style={{ gap: 12, alignItems: 'center', paddingTop: 8 }}>
              <Pair company={sel} icon="clock" tone={['input', 'textBody']} />
              <Text variant="title" align="center">
                Request sent
              </Text>
              <Text variant="body" color="textPrimary" align="center" style={{ fontSize: 14 }}>
                {sel.name} will confirm that you work for them. We’ll let you know as soon as they answer.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: c.input }}>
              <Icon name="notification" size={18} color="primary" />
              <Text variant="bodyS" color="textPrimary" style={{ flex: 1 }}>
                Turn on notifications so you don’t miss the answer
              </Text>
            </View>
            <Button label="Turn on notifications" onPress={closeSent} />
            <Button variant="secondary" label="Later" onPress={closeSent} />
          </BottomSheet>

          <BottomSheet visible={stage === 'approved'} onClose={() => setStage('pick')}>
            <View style={{ gap: 12, alignItems: 'center', paddingTop: 8 }}>
              <Pair company={sel} icon="check" tone={['successBack', 'successText']} />
              <Text variant="title" align="center">
                You’re in!
              </Text>
              <Text variant="body" color="textPrimary" align="center" style={{ fontSize: 14 }}>
                {sel.name} confirmed you as their recruiter. You can post vacancies and invite candidates now.
              </Text>
            </View>
            <Button label="Start hiring" onPress={() => finish({ role: 'employer', firstName: employer.firstName, company: { name: sel.name, status: 'approved' } })} />
          </BottomSheet>

          <BottomSheet visible={stage === 'declined'} onClose={() => setStage('pick')}>
            <View style={{ gap: 12, alignItems: 'center', paddingTop: 8 }}>
              <Pair company={sel} icon="cancel" tone={['dangerBack', 'dangerText']} />
              <Text variant="title" align="center">
                Request declined
              </Text>
              <Text variant="body" color="textPrimary" align="center" style={{ fontSize: 14 }}>
                {sel.name} didn’t confirm your request. Try another company or sign up as a private recruiter.
              </Text>
            </View>
            <Button label="Choose another company" onPress={() => (setEmployer({ joinCompanyId: undefined }), setStage('pick'))} />
            <Button
              variant="secondary"
              label="Sign up as private recruiter"
              onPress={() => {
                setStage('pick');
                setEmployer({ mode: 'private', joinCompanyId: undefined });
                router.replace({ pathname: '/employer/review', params: { mode: 'private' } });
              }}
            />
          </BottomSheet>
        </>
      ) : null}
    </FormScreen>
  );
}
