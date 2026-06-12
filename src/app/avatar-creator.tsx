import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarViewer } from '@/components/three/AvatarViewer';
import { ChipRow, ColorPalette, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import {
  BODY_TYPES, EYE_STYLES, FACE_SHAPES, HAIR_COLORS, HAIR_STYLES, HEIGHTS, MOUTH_STYLES, SKIN_COLORS,
} from '@/constants/avatar-parts';
import { D } from '@/constants/design';
import { useAvatar } from '@/stores/avatar';

export default function AvatarCreatorScreen() {
  const { config, set, created, markCreated, randomize } = useAvatar();

  const done = () => {
    markCreated();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewer}>
        <AvatarViewer config={config} mode="creator" />
        <Pressable style={styles.randomBtn} onPress={randomize}>
          <Text style={{ fontSize: 14 }}>🎲 ランダム</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <SectionLabel>肌の色</SectionLabel>
        <ColorPalette colors={SKIN_COLORS} value={config.skinColor} onChange={(c) => set({ skinColor: c })} />

        <SectionLabel>顔型</SectionLabel>
        <ChipRow options={[...FACE_SHAPES]} value={config.faceShape} onChange={(id) => set({ faceShape: id })} />

        <SectionLabel>目</SectionLabel>
        <ChipRow options={[...EYE_STYLES]} value={config.eyes} onChange={(id) => set({ eyes: id })} />

        <SectionLabel>口</SectionLabel>
        <ChipRow options={[...MOUTH_STYLES]} value={config.mouth} onChange={(id) => set({ mouth: id })} />

        <SectionLabel>髪型</SectionLabel>
        <ChipRow options={[...HAIR_STYLES]} value={config.hairStyle} onChange={(id) => set({ hairStyle: id })} />

        <SectionLabel>髪色</SectionLabel>
        <ColorPalette colors={HAIR_COLORS} value={config.hairColor} onChange={(c) => set({ hairColor: c })} />

        <SectionLabel>体型</SectionLabel>
        <ChipRow options={[...BODY_TYPES]} value={config.bodyType} onChange={(id) => set({ bodyType: id })} />

        <SectionLabel>身長</SectionLabel>
        <ChipRow options={[...HEIGHTS]} value={config.height} onChange={(id) => set({ height: id })} />

        <PrimaryButton
          title={created ? '保存して戻る' : 'これでスタート！'}
          onPress={done}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EEE9' },
  viewer: { height: '42%' },
  randomBtn: {
    position: 'absolute', bottom: 10, right: 14, backgroundColor: '#FFFFFFE6',
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: D.border,
  },
  panel: {
    flex: 1, backgroundColor: D.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
});
