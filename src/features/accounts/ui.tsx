// Several accounts on one phone: avatar, rows, switch sheet, header chip, "Switching to…" screen and the banner after a switch.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Icon, Pressable, Text } from '@/components';
import { useEmployer } from '@/data/employer';
import { useSeeker } from '@/data/seeker';
import { initialsOf, MAX_ACCOUNTS, useSession, type Account } from '@/data/session';
import { useTheme } from '@/theme';

/** Seeker: round photo (or initials). Employer: rounded dark tile with the company initials. */
export function AccountAvatar({ account, size = 44, ring }: { account: Account; size?: number; ring?: boolean }) {
  const { c } = useTheme();
  const seeker = account.role === 'seeker';
  const radius = seeker ? size / 2 : Math.round(size * 0.3);
  const inner = seeker && account.photo ? (
    <Image source={account.photo} contentFit="cover" contentPosition={{ top: '20%' }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: c.avatar3 }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: seeker ? c.avatar2 : c.inverse, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="displayM" color={seeker ? 'textHeadline' : 'onInverse'} style={{ fontSize: Math.round(size * 0.34), lineHeight: Math.round(size * 0.42) }}>
        {initialsOf(account.name)}
      </Text>
    </View>
  );
  if (!ring) return inner;
  // Current account: a 2 px gap in the surface colour, then a 2 px blue ring.
  return (
    <View style={{ padding: 2, borderRadius: radius + 4, borderWidth: 2, borderColor: c.primary, margin: -4 }}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>{inner}</View>
    </View>
  );
}

function RoleTag({ role }: { role: Account['role'] }) {
  const { c } = useTheme();
  const seeker = role === 'seeker';
  return (
    <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: seeker ? c.primarySecondary : c.labelOrangeBack, justifyContent: 'center' }}>
      <Text variant="caption" weight={700} color={seeker ? 'link' : 'infoText'} style={{ fontSize: 11 }}>
        {seeker ? 'Job seeker' : 'Employer'}
      </Text>
    </View>
  );
}

/** Unread messages waiting in an account; shown next to the accounts you're not in. */
export function useAccountUnread() {
  const employer = useEmployer();
  const seeker = useSeeker();
  return (a: Account) => (a.role === 'employer' ? employer.unreadTotal : seeker.unreadTotal);
}

export function AccountRow({ account, current, last, onPress }: { account: Account; current?: boolean; last?: boolean; onPress?: () => void }) {
  const { c } = useTheme();
  const unread = useAccountUnread()(account);
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 72, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderColor: c.divider }}>
      <AccountAvatar account={account} ring={current} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyL" weight={600} numberOfLines={1}>
          {account.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <RoleTag role={account.role} />
          <Text variant="bodyS" color="textBody" numberOfLines={1} style={{ flexShrink: 1, fontSize: 13 }}>
            {account.detail}
          </Text>
        </View>
      </View>
      {current ? (
        <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.successBack, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="check" size={14} color="successText" />
          <Text variant="caption" weight={700} color="successText" style={{ fontSize: 12 }}>
            Current
          </Text>
        </View>
      ) : (
        <>
          {unread ? (
            <View accessibilityLabel={`${unread} new`} style={{ minWidth: 22, height: 22, paddingHorizontal: 7, borderRadius: 999, backgroundColor: c.error, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="caption" weight={700} color="#FFFFFF" style={{ fontSize: 12 }}>
                {unread}
              </Text>
            </View>
          ) : null}
          <Icon name="chevron-right" size={18} color="textLightSecondary" />
        </>
      )}
    </View>
  );
  if (current || !onPress) return <View accessibilityState={{ selected: !!current }}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Switch to ${account.name}`}>
      {body}
    </Pressable>
  );
}

function AddRow({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.textLightSecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="add" size={20} color="link" />
      </View>
      <Text variant="bodyL" weight={600} color="link" style={{ flex: 1 }}>
        Add account
      </Text>
    </Pressable>
  );
}

/** Current account first, then the others, then "Add account" (until the limit). */
export function AccountsList({ onSwitch, onAdd }: { onSwitch: (id: string) => void; onAdd: () => void }) {
  const { user, accounts } = useSession();
  const list = user ? [user, ...accounts.filter((a) => a.id !== user.id)] : accounts;
  const canAdd = accounts.length < MAX_ACCOUNTS;
  return (
    <View>
      {list.map((a, i) => (
        <AccountRow key={a.id} account={a} current={a.id === user?.id} last={!canAdd && i === list.length - 1} onPress={() => onSwitch(a.id)} />
      ))}
      {canAdd ? <AddRow onPress={onAdd} /> : null}
    </View>
  );
}

/** Settings: the Accounts block (AccSettings / AccSettingsOne). */
export function AccountsGroup() {
  const { c } = useTheme();
  const { switchTo } = useSession();
  return (
    <>
      <View style={{ backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 4 }}>
        <AccountsList onSwitch={switchTo} onAdd={() => router.push('/accounts/add')} />
      </View>
      <Text variant="bodyS" color="textBody" style={{ paddingHorizontal: 4, fontSize: 13, lineHeight: 19 }}>
        Each account keeps its own profile, chats and subscription. Notifications from all accounts come to this phone.
      </Text>
    </>
  );
}

// ---- switch sheet, header chip, switching screen, banner ----

const Ui = createContext<{ openSwitcher: () => void }>({ openSwitcher: () => {} });
export const useAccountSwitcher = () => useContext(Ui);

function SwitchSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const { user, accounts, switchTo } = useSession();
  const both = new Set(accounts.map((a) => a.role)).size > 1;
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
        <Text variant="displayM" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 26 }}>
          Switch account
        </Text>
        <Pressable onPress={() => (onClose(), router.push(user?.role === 'employer' ? '/company/settings' : '/profile/settings'))} accessibilityRole="link" hitSlop={8}>
          <Text variant="body" weight={600} color="link" style={{ fontSize: 14 }}>
            Manage
          </Text>
        </Pressable>
      </View>
      <AccountsList onSwitch={(id) => (onClose(), switchTo(id))} onAdd={() => (onClose(), router.push('/accounts/add'))} />
      {accounts.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.input }}>
          <Icon name="notification" size={16} color="textBody" />
          <Text variant="bodyS" color="textBody" style={{ flex: 1, fontSize: 13, lineHeight: 19 }}>
            You get notifications from {both || accounts.length === 2 ? 'both accounts' : 'all accounts'}. Tap one to open it in that account.
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}

/** Header chip on the employer's Vacancies: the current account, the other one with a dot when it has news, and a chevron. */
export function AccountChip() {
  const { c } = useTheme();
  const { user, accounts } = useSession();
  const { openSwitcher } = useAccountSwitcher();
  const unread = useAccountUnread();
  if (!user || accounts.length < 2) return null;
  const other = accounts.find((a) => a.id !== user.id)!;
  const news = accounts.some((a) => a.id !== user.id && unread(a) > 0);
  return (
    <Pressable
      onPress={openSwitcher}
      accessibilityRole="button"
      accessibilityLabel={`Switch account, now ${user.name}`}
      style={{ height: 44, paddingLeft: 4, paddingRight: 6, borderRadius: 14, borderWidth: 1, borderColor: c.stroke, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <AccountAvatar account={user} size={32} />
      <View>
        <AccountAvatar account={other} size={22} />
        {news ? <View style={{ position: 'absolute', right: -3, bottom: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: c.error, borderWidth: 2, borderColor: c.surface }} /> : null}
      </View>
      <Icon name="chevron-down" size={16} color="textBody" />
    </Pressable>
  );
}

function Switching({ from, to }: { from: Account | null; to: Account }) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityViewIsModal style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100, backgroundColor: '#3589F2', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: insets.top }}>
      <Image source={require('@/assets/images/pattern-3d.jpg')} contentFit="cover" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {from ? (
          <View style={{ opacity: 0.55 }}>
            <AccountAvatar account={from} size={64} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 6 }} aria-hidden>
          {[0.4, 0.7, 1].map((o) => (
            <View key={o} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: o }} />
          ))}
        </View>
        <View style={{ padding: 3, borderRadius: to.role === 'seeker' ? 50 : 29, backgroundColor: '#FFFFFF' }}>
          <AccountAvatar account={to} size={88} />
        </View>
      </View>
      <View accessibilityRole="text" accessibilityLiveRegion="polite" style={{ marginTop: 22, alignItems: 'center', gap: 6 }}>
        <Text variant="displayM" color="#FFFFFF" align="center" style={{ fontSize: 22, lineHeight: 29 }}>
          {`Switching to\n${to.name}`}
        </Text>
        <Text variant="body" color="#FFFFFF" style={{ fontSize: 15, opacity: 0.9 }}>
          {to.role === 'seeker' ? 'Job seeker account' : 'Employer account'}
        </Text>
      </View>
    </View>
  );
}

function SwitchedBanner({ account, onSwitch, onDone }: { account: Account; onSwitch: () => void; onDone: () => void }) {
  const { c } = useTheme();
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const t = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(onDone), 4000);
    return () => clearTimeout(t);
  }, [a, onDone]);
  return (
    <Animated.View
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 104,
        zIndex: 90,
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        backgroundColor: c.inverse,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#0E1A2B',
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 12 },
        elevation: 8,
      }}>
      <AccountAvatar account={account} size={32} />
      <View style={{ flex: 1 }}>
        <Text variant="body" weight={700} color="onInverse" style={{ fontSize: 14, lineHeight: 19 }}>
          {account.name}
        </Text>
        <Text variant="body" color="onInverse" style={{ fontSize: 14, lineHeight: 19, opacity: 0.8 }}>
          {account.role === 'seeker' ? 'You’re now in the job seeker account' : 'You’re now in the employer account'}
        </Text>
      </View>
      <Pressable onPress={onSwitch} accessibilityRole="button" hitSlop={8}>
        <Text variant="body" weight={700} color="#6AA8FF" style={{ fontSize: 14 }}>
          Switch
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Mounted once at the root: the switch sheet, the "Switching to…" screen and the banner that follows. */
export function AccountSwitcherProvider({ children }: { children: ReactNode }) {
  const { switching, switchingFrom, finishSwitch } = useSession();
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState<Account | null>(null);

  useEffect(() => {
    if (!switching) return;
    const t = setTimeout(() => {
      const to = finishSwitch();
      if (!to) return;
      if (router.canDismiss()) router.dismissAll();
      // The employer lands on Vacancies, where the account chip lives (AccSwitched).
      setTimeout(() => router.replace(to.role === 'seeker' ? '/seeker' : '/hire/vacancies'), 0);
      setDone(to);
    }, 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switching?.id]);

  return (
    <Ui.Provider value={{ openSwitcher: () => setSheet(true) }}>
      {children}
      {done && !switching ? <SwitchedBanner key={done.id} account={done} onSwitch={() => (setDone(null), setSheet(true))} onDone={() => setDone(null)} /> : null}
      {switching ? <Switching from={switchingFrom} to={switching} /> : null}
      <SwitchSheet visible={sheet} onClose={() => setSheet(false)} />
    </Ui.Provider>
  );
}
