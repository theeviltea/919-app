import { View } from 'react-native';

import { Line, VacancyCardSk } from './SeekParts';

/** MainSkeleton: section title and vacancy cards under the real header and chips. */
export function SeekFeedSkeleton() {
  return (
    <View accessibilityLabel="Loading vacancies" style={{ paddingHorizontal: 20, gap: 12 }}>
      <View style={{ height: 32, justifyContent: 'center' }}>
        <Line w={104} h={14} />
      </View>
      {[0, 1, 2, 3].map((i) => (
        <VacancyCardSk key={i} i={i} />
      ))}
    </View>
  );
}
