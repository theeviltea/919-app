import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useTheme } from '@/theme';
import { CHAT_TILE, chatTileXml } from './chatPattern';

/** Static 919 pattern behind the messages (design: SeekChat #chatpat). Tiles to fill any size; doesn't scroll. */
export function ChatBackground() {
  const { c } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const xml = chatTileXml(c.chatPattern, c.back);
  const cols = Math.max(1, Math.ceil(size.w / CHAT_TILE.width));
  const rows = Math.max(1, Math.ceil(size.h / CHAT_TILE.height));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: c.back }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w
        ? Array.from({ length: rows * cols }, (_, i) => (
            <SvgXml
              key={i}
              xml={xml}
              width={CHAT_TILE.width}
              height={CHAT_TILE.height}
              style={{ position: 'absolute', left: (i % cols) * CHAT_TILE.width, top: Math.floor(i / cols) * CHAT_TILE.height }}
            />
          ))
        : null}
    </View>
  );
}
