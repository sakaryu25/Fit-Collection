import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarViewer } from '@/components/three/AvatarViewer';
import { pickPhoto } from '@/components/ui/ItemFormShared';
import { ChipRow, ColorPalette, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import {
  BODY_TYPES, BROW_STYLES, EYE_STYLES, FACE_SHAPES, HAIR_COLORS, HAIR_STYLES, HEIGHTS, MOUTH_STYLES, SKIN_COLORS,
} from '@/constants/avatar-parts';
import { D } from '@/constants/design';
import { aiAvailable, generateAvatarFromPhoto } from '@/lib/ai-avatar';
import { useAvatar } from '@/stores/avatar';

export default function AvatarCreatorScreen() {
  const { config, set, created, markCreated, randomize } = useAvatar();
  const [aiLoading, setAiLoading] = useState(false);

  const done = () => {
    markCreated();
    router.back();
  };

  const generateFromPhoto = async (fromCamera: boolean) => {
    const uri = await pickPhoto(fromCamera);
    if (!uri) return;
    setAiLoading(true);
    try {
      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 512 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      if (!resized.base64) throw new Error('画像の読み込みに失敗しました');
      const generated = await generateAvatarFromPhoto(resized.base64, 'image/jpeg');
      set(generated);
    } catch (e) {
      Alert.alert('AI生成に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setAiLoading(false);
    }
  };

  const askPhotoSource = () => {
    if (!aiAvailable()) {
      Alert.alert(
        'APIキーが未設定です',
        'AI生成には EXPO_PUBLIC_ANTHROPIC_API_KEY の設定が必要です。手動でパーツを選んでアバターを作れます。',
      );
      return;
    }
    Alert.alert('写真からAIで作る', '顔写真からあなたっぽいアバターを生成します', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '📸 カメラで撮影', onPress: () => generateFromPhoto(true) },
      { text: '🖼 写真から選ぶ', onPress: () => generateFromPhoto(false) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewer}>
        <AvatarViewer config={config} mode="creator" />
        <Pressable style={styles.randomBtn} onPress={randomize}>
          <Text style={{ fontSize: 14 }}>🎲 ランダム</Text>
        </Pressable>
        {aiLoading && (
          <View style={styles.aiOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.aiOverlayText}>あなたっぽさを解析中…</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Pressable style={styles.aiBtn} onPress={askPhotoSource} disabled={aiLoading}>
          <Text style={styles.aiBtnText}>✨ 写真からAIで作る</Text>
          <Text style={styles.aiBtnSub}>顔写真からパーツを自動で選びます。あとから自由に調整OK</Text>
        </Pressable>

        <SectionLabel>肌の色</SectionLabel>
        <ColorPalette colors={SKIN_COLORS} value={config.skinColor} onChange={(c) => set({ skinColor: c })} />

        <SectionLabel>顔型</SectionLabel>
        <ChipRow options={[...FACE_SHAPES]} value={config.faceShape} onChange={(id) => set({ faceShape: id })} />

        <SectionLabel>目</SectionLabel>
        <ChipRow options={[...EYE_STYLES]} value={config.eyes} onChange={(id) => set({ eyes: id })} />

        <SectionLabel>眉</SectionLabel>
        <ChipRow options={[...BROW_STYLES]} value={config.brows ?? 'natural'} onChange={(id) => set({ brows: id })} />

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
  aiOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#111111AA', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  aiOverlayText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  panel: {
    flex: 1, backgroundColor: D.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  aiBtn: {
    backgroundColor: '#111111', borderRadius: D.radiusCard, padding: 16, gap: 4,
  },
  aiBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  aiBtnSub: { color: '#FFFFFFAA', fontSize: 11, lineHeight: 16 },
});
