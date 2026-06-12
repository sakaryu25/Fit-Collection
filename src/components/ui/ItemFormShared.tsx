import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarViewer } from '@/components/three/AvatarViewer';
import { D } from '@/constants/design';
import { templatesFor } from '@/constants/templates';
import type { CategoryId } from '@/constants/taxonomy';
import { useAvatar } from '@/stores/avatar';
import type { ItemLook } from '@/types';
import { Chip, SectionLabel } from './kit';

// 服登録フォーム共通: 写真ピッカー / 見え方設定（テンプレ+丈+ゆとり+プレビュー）

export async function pickPhoto(fromCamera: boolean): Promise<string | null> {
  if (fromCamera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    return res.canceled ? null : res.assets[0].uri;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    quality: 0.7, allowsEditing: true, aspect: [1, 1], mediaTypes: 'images',
  });
  return res.canceled ? null : res.assets[0].uri;
}

export function PhotoPicker({ uri, onPick }: { uri?: string; onPick: (uri: string) => void }) {
  const pick = async (camera: boolean) => {
    const picked = await pickPhoto(camera);
    if (picked) onPick(picked);
  };
  return (
    <View style={styles.photoRow}>
      <View style={styles.photoBox}>
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 34 }}>📷</Text>
        )}
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <Pressable style={styles.photoBtn} onPress={() => pick(true)}>
          <Text style={styles.photoBtnText}>📸 カメラで撮影</Text>
        </Pressable>
        <Pressable style={styles.photoBtn} onPress={() => pick(false)}>
          <Text style={styles.photoBtnText}>🖼 写真から選ぶ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const LENGTHS = [
  { id: -0.7, label: '短め' },
  { id: 0, label: 'ふつう' },
  { id: 0.7, label: '長め' },
];
const OVERSIZES = [
  { id: 0, label: 'ジャスト' },
  { id: 0.45, label: 'ふつう' },
  { id: 1, label: 'オーバー' },
];

export function LookEditor({ category, look, baseColorHex, onChange }: {
  category: CategoryId;
  look: ItemLook;
  baseColorHex: string;
  onChange: (look: ItemLook) => void;
}) {
  const avatar = useAvatar((s) => s.config);
  const templates = templatesFor(category);
  const previewLook: ItemLook = { ...look, base_color: baseColorHex };

  return (
    <View>
      <SectionLabel>アバターでの見え方</SectionLabel>
      <View style={styles.previewBox}>
        <AvatarViewer
          config={avatar}
          worn={{ [category]: { source: 'closet', itemId: 'preview', look: previewLook } }}
          mode="mini"
          rotatable={false}
        />
      </View>

      <SectionLabel>かたち</SectionLabel>
      <View style={styles.wrapRow}>
        {templates.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            selected={look.template_id === t.id}
            onPress={() => onChange({ ...look, template_id: t.id })}
          />
        ))}
      </View>

      {['tops', 'bottoms', 'outer', 'onepiece'].includes(category) && (
        <>
          <SectionLabel>丈感</SectionLabel>
          <View style={styles.wrapRow}>
            {LENGTHS.map((l) => (
              <Chip
                key={l.id}
                label={l.label}
                selected={look.morphs.length === l.id}
                onPress={() => onChange({ ...look, morphs: { ...look.morphs, length: l.id } })}
              />
            ))}
          </View>
          <SectionLabel>ゆとり感</SectionLabel>
          <View style={styles.wrapRow}>
            {OVERSIZES.map((o) => (
              <Chip
                key={o.id}
                label={o.label}
                selected={look.morphs.oversize === o.id}
                onPress={() => onChange({ ...look, morphs: { ...look.morphs, oversize: o.id } })}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  photoBox: {
    width: 110, height: 110, borderRadius: 14, backgroundColor: '#F4F2EF',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: D.border,
  },
  photoBtn: {
    borderWidth: 1, borderColor: D.border, borderRadius: 12, paddingVertical: 11,
    alignItems: 'center', backgroundColor: D.surface,
  },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: D.textPrimary },
  previewBox: {
    height: 240, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F1EEE9',
    borderWidth: 1, borderColor: D.border,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
