import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Button, Field, Icon, Pressable, Text, useToast } from '@/components';
import { useEmployer, type Member } from '@/data/employer';
import { Round } from '@/features/hire/ui';
import { GroupLabel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

function RolePill({ role }: { role: Member['role'] }) {
  const { c } = useTheme();
  const admin = role === 'Admin';
  return (
    <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: admin ? c.primarySecondary : c.input, justifyContent: 'center' }}>
      <Text variant="caption" weight={700} color={admin ? 'link' : 'textBody'} style={{ fontSize: 12 }}>
        {role}
      </Text>
    </View>
  );
}

/** Employer — Team and roles (EmpTeam): invite, join requests, members with roles, role descriptions. */
export default function EmployerTeam() {
  const { c } = useTheme();
  const toast = useToast();
  const { members, joinRequests, resolveJoin, addMember, updateMember, removeMember } = useEmployer();
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [menu, setMenu] = useState<Member | null>(null);
  const admins = members.filter((m) => m.role === 'Admin').length;

  return (
    <SubScreen title="Team and roles">
      <Pressable onPress={() => setInvite(true)} accessibilityRole="button" style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
        <Icon name="add" size={18} color="link" />
        <Text variant="body" weight={700} color="link" style={{ fontSize: 15 }}>
          Invite recruiter
        </Text>
      </Pressable>

      {joinRequests.length ? (
        <>
          <GroupLabel>{`Join requests · ${joinRequests.length}`}</GroupLabel>
          {joinRequests.map((j) => (
            <View key={j.id} style={{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Round source={j.photo} size={44} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                    {j.name}
                  </Text>
                  <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ marginTop: 2, fontSize: 13 }}>
                    {j.email} · {j.when}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button variant="neutral" label="Decline" onPress={() => (resolveJoin(j.id), toast({ text: 'Request declined', icon: 'cancel' }))} style={{ flex: 1 }} />
                <Button
                  label="Accept"
                  onPress={() => (resolveJoin(j.id), addMember({ id: j.id, name: j.name, role: 'Recruiter', title: 'Recruiter', photo: j.photo, vacancies: 0 }), toast({ text: `${j.name.split(' ')[0]} joined as Recruiter`, icon: 'check' }))}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ))}
        </>
      ) : null}

      <GroupLabel>{`Members · ${members.length}`}</GroupLabel>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18 }}>
        {members.map((m, i) => (
          <View key={m.id} style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: i < members.length - 1 ? 1 : 0, borderColor: c.divider }}>
            <Round source={m.photo} size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body" weight={700} numberOfLines={1} style={{ fontSize: 15 }}>
                {m.name}
                {m.you ? (
                  <Text variant="body" weight={400} color="textLightSecondary" style={{ fontSize: 15 }}>
                    {' '}
                    · you
                  </Text>
                ) : null}
              </Text>
              <Text variant="bodyS" color="textBody" numberOfLines={2} style={{ marginTop: 2, fontSize: 13 }}>
                {m.you ? m.title : `${m.role} · ${m.vacancies ?? 0} vacanc${m.vacancies === 1 ? 'y' : 'ies'}`}
              </Text>
            </View>
            <RolePill role={m.role} />
            {!m.you ? (
              <Pressable onPress={() => setMenu(m)} accessibilityRole="button" accessibilityLabel={`Actions for ${m.name}`} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="more" size={18} color="textHeadline" />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <GroupLabel>Roles</GroupLabel>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18 }}>
        {(
          [
            ['verified', 'Admin', 'Edits the company profile, manages the team and the subscription, posts vacancies and chats with candidates.'],
            ['user', 'Recruiter', 'Posts and edits own vacancies, reviews applicants and chats with candidates.'],
          ] as const
        ).map(([icon, t, d], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12, paddingVertical: 16, borderBottomWidth: i === 0 ? 1 : 0, borderColor: c.divider }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: i === 0 ? c.primarySecondary : c.input, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={20} color={i === 0 ? 'primary' : 'textBody'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                {t}
              </Text>
              <Text variant="bodyS" color="textBody" style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
                {d}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <BottomSheet visible={invite} onClose={() => setInvite(false)} title="Invite recruiter" subtitle="They get an email with a link to join your company as Recruiter." closable>
        <Field label="Work email" value={email} onChangeText={setEmail} placeholder="name@company.com" keyboardType="email-address" autoCapitalize="none" autoFocus />
        <Button
          size="l"
          label="Send invite"
          disabled={!emailOk(email)}
          onPress={() => {
            setInvite(false);
            toast({ text: `Invite sent to ${email.trim()}`, icon: 'mail' });
            setEmail('');
          }}
        />
      </BottomSheet>

      <BottomSheet visible={!!menu} onClose={() => setMenu(null)} title={menu?.name} subtitle={menu ? `${menu.role} · ${menu.title}` : undefined} closable>
        {menu ? (
          <View style={{ gap: 12 }}>
            <Button
              variant="neutral"
              icon={menu.role === 'Admin' ? 'user' : 'verified'}
              label={menu.role === 'Admin' ? 'Make Recruiter' : 'Make Admin'}
              disabled={menu.role === 'Admin' && admins <= 1}
              onPress={() => {
                updateMember(menu.id, { role: menu.role === 'Admin' ? 'Recruiter' : 'Admin' });
                toast({ text: `${menu.name.split(' ')[0]} is now ${menu.role === 'Admin' ? 'Recruiter' : 'Admin'}`, icon: 'check' });
                setMenu(null);
              }}
            />
            <Button
              variant="danger"
              icon="trash"
              label="Remove from team"
              onPress={() => {
                removeMember(menu.id);
                toast({ text: `${menu.name.split(' ')[0]} removed from the team`, icon: 'trash' });
                setMenu(null);
              }}
            />
          </View>
        ) : null}
      </BottomSheet>
    </SubScreen>
  );
}
