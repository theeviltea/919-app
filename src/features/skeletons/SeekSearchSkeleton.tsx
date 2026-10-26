import { View } from 'react-native';

import { Line, VacancyCardSk } from './SeekParts';

/** SeekSearchResultsSkeleton: results count row and vacancy cards under the search bar and filter chips. */
export function SeekSearchSkeleton() {
  return (
    <View accessibilityLabel="Loading results" style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 20 }}>
        <Line w={80} h={9} />
        <Line w={68} h={9} />
        <View style={{ flex: 1 }} />
        <Line w={44} h={9} />
      </View>
      {[1, 0, 2, 3].map((i) => (
        <VacancyCardSk key={i} i={i} />
      ))}
    </View>
  );
}
