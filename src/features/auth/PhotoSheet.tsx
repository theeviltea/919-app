import type { ImageSourcePropType } from 'react-native';

import { BottomSheet, Button } from '@/components';

import { pickImages } from './pickImage';

/**
 * Photo source sheet. "Use a sample photo" exists only in the prototype, so the flow can be
 * clicked through on web without a camera roll.
 */
export function PhotoSheet({
  visible,
  title = 'Add a photo',
  onClose,
  onPicked,
  sample,
  multiple,
  limit,
  square,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onPicked: (s: ImageSourcePropType[]) => void;
  sample: ImageSourcePropType | ImageSourcePropType[];
  multiple?: boolean;
  limit?: number;
  square?: boolean;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} closable>
      <Button
        label="Choose from library"
        icon="image"
        onPress={async () => {
          const r = await pickImages({ multiple, limit, square });
          onClose();
          if (r.length) onPicked(r);
        }}
      />
      <Button variant="neutral" label="Use a sample photo" onPress={() => (onClose(), onPicked(Array.isArray(sample) ? sample : [sample]))} />
    </BottomSheet>
  );
}
