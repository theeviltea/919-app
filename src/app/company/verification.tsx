import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Icon, Text, useToast } from '@/components';
import { useEmployer } from '@/data/employer';
import { BadgePreview, Facts, FileCard, pickLicence, StatusDot, UploadCard } from '@/features/employer/Licence';
import { Pill } from '@/features/hire/ui';
import { Panel, SubScreen } from '@/features/profile/ui';
import { useTheme } from '@/theme';

function Header({ dot, title, sub }: { dot: ReactNode; title: string; sub: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {dot}
      <View style={{ flex: 1 }}>
        <Text variant="body" weight={700} style={{ fontSize: 17 }}>
          {title}
        </Text>
        <Text variant="bodyS" color="textBody" style={{ marginTop: 2 }}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

/** Employer — Verification (EmpVerifyNone / Review / Rejected / Done): trade licence and the verified badge. */
export default function Verification() {
  const { c } = useTheme();
  const toast = useToast();
  const { licence, sendLicence, info } = useEmployer();
  const upload = async () => {
    try {
      const f = await pickLicence();
      if (f) {
        sendLicence(f);
        toast({ text: 'Trade licence sent. We’ll check it within 24 hours', icon: 'check' });
      }
    } catch (e) {
      toast({ text: e instanceof Error ? e.message : 'Couldn’t open the file', icon: 'alert-circle' });
    }
  };
  const s = licence.status;

  const footer =
    s === 'none' ? (
      <Button size="l" label="Upload trade licence" onPress={upload} />
    ) : s === 'rejected' ? (
      <Button size="l" label="Upload new licence" onPress={upload} />
    ) : (
      <Button size="l" variant="secondary" icon="file" label="Replace file" onPress={upload} />
    );

  return (
    <SubScreen title="Verification" footer={footer}>
      {s === 'none' ? (
        <>
          <Panel gap={12}>
            <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: c.input, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="verified" size={34} color="textLightSecondary" />
              </View>
              <Text variant="title" align="center" style={{ fontSize: 19 }}>
                Not verified yet
              </Text>
              <Text variant="body" color="textPrimary" align="center" style={{ fontSize: 14, lineHeight: 20 }}>
                Upload your trade licence. When the 919 team checks it, the badge appears next to your company name.
              </Text>
            </View>
            <Text variant="bodyS" weight={600} color="textBody">
              How candidates will see you
            </Text>
            <BadgePreview />
          </Panel>
          <UploadCard onPress={upload} />
          <Facts
            items={[
              ['lock', 'Only the 919 team sees this file.'],
              ['clock', 'We check it within 24 hours.'],
            ]}
          />
        </>
      ) : s === 'review' ? (
        <>
          <Panel>
            <Header dot={<StatusDot icon="clock" bg="primarySecondary" fg="link" size={48} />} title="Licence on review" sub={`Sent ${licence.sentAt ?? 'today'} · usually within 24 hours`} />
          </Panel>
          {licence.file ? <FileCard file={licence.file} meta={`${licence.file.size} · sent ${licence.sentAt ?? 'today'}`} right={<Pill label="On review" bg={c.primarySecondary} fg={c.link} h={26} />} /> : null}
          <View style={{ backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 }}>
            {(
              [
                ['done', 'Licence uploaded'],
                ['now', 'Check by the 919 team'],
                ['later', 'Badge next to your company name'],
              ] as const
            ).map(([st, label], i) => (
              <View key={label} style={{ height: 52, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: i < 2 ? 1 : 0, borderColor: c.divider }}>
                {st === 'done' ? (
                  <StatusDot icon="check" bg="successBack" fg="successText" />
                ) : st === 'now' ? (
                  <StatusDot icon="clock" bg="input" fg="textBody" />
                ) : (
                  <StatusDot icon="verified" bg="input" fg="textLightSecondary" />
                )}
                <Text variant="body" weight={st === 'now' ? 600 : 400} color={st === 'later' ? 'textBody' : 'textHeadline'} style={{ flex: 1, fontSize: 15 }}>
                  {label}
                </Text>
                {st === 'now' ? <Pill label="In progress" bg={c.input} fg={c.textBody} h={24} /> : null}
              </View>
            ))}
          </View>
          <Text variant="bodyS" color="textBody" style={{ paddingHorizontal: 4, lineHeight: 19 }}>
            You can keep posting vacancies and chatting while we check.
          </Text>
        </>
      ) : s === 'rejected' ? (
        <>
          <Panel>
            <Header dot={<StatusDot icon="alert-circle" bg="dangerBack" fg="dangerText" size={48} />} title="Licence wasn’t accepted" sub={`Checked on ${licence.checkedAt ?? '—'} · the badge isn’t shown`} />
            {licence.reason ? (
              <View style={{ borderRadius: 16, backgroundColor: c.dangerBack, padding: 12, paddingHorizontal: 14 }}>
                <Text variant="caption" weight={700} color="dangerText" style={{ fontSize: 12 }}>
                  Reason from the 919 team
                </Text>
                <Text variant="body" style={{ marginTop: 4, fontSize: 14, lineHeight: 20 }}>
                  {licence.reason}
                </Text>
              </View>
            ) : null}
          </Panel>
          {licence.file ? <FileCard file={licence.file} meta={`Sent ${licence.sentAt ?? ''}`} right={<Pill label="Rejected" bg={c.dangerBack} fg={c.dangerText} h={26} />} dim /> : null}
          <Facts
            items={[
              ['calendar', 'Licence must be valid today.'],
              ['building', `Company name on the licence must match ${info.name}.`],
            ]}
          />
        </>
      ) : (
        <>
          <Panel>
            <Header dot={<StatusDot icon="verified" bg="successBack" fg="successText" size={48} />} title="Verified employer" sub={`Verified on ${licence.checkedAt ?? ''} by the 919 team`} />
            <BadgePreview />
          </Panel>
          {licence.file ? (
            <>
              <Text variant="bodyS" weight={600} color="textBody" style={{ paddingHorizontal: 4, paddingTop: 4 }}>
                Document
              </Text>
              <FileCard
                file={licence.file}
                meta={`${licence.file.size} · approved ${licence.checkedAt ?? ''}`}
                right={<Pill label="Approved" icon="check" bg={c.successBack} fg={c.successText} h={26} />}
              />
            </>
          ) : null}
          <View style={{ backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 2 }}>
            {(
              [
                ['Licence number', licence.number ?? '—'],
                ['Issued by', licence.issuer ?? '—'],
                ['Valid until', licence.validUntil ?? '—'],
              ] as const
            ).map(([k, v], i) => (
              <View key={k} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: i < 2 ? 1 : 0, borderColor: c.divider }}>
                <Text variant="body" color="textBody" style={{ fontSize: 14 }}>
                  {k}
                </Text>
                <Text variant="body" weight={600} style={{ fontSize: 14 }}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="bodyS" color="textBody" style={{ paddingHorizontal: 4, lineHeight: 19 }}>
            Only the 919 team sees this file. Candidates see the badge next to your company name.
          </Text>
        </>
      )}
    </SubScreen>
  );
}
