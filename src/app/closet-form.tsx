import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { LookEditor, PhotoPicker } from '@/components/ui/ItemFormShared';
import { ChipRow, ColorPalette, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { defaultTemplateFor } from '@/constants/templates';
import {
  CATEGORIES, COLORS, SEASONS, STYLES, colorHex,
  type CategoryId, type ColorId, type SeasonId, type StyleId,
} from '@/constants/taxonomy';
import { useCloset } from '@/stores/closet';
import type { ItemLook } from '@/types';

export default function ClosetFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const closet = useCloset();
  const editing = id ? closet.items.find((i) => i.id === id) : undefined;

  const [photoUri, setPhotoUri] = useState(editing?.photoUri);
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'tops');
  const [color, setColor] = useState<ColorId>(editing?.color ?? 'black');
  const [styleTags, setStyleTags] = useState<StyleId[]>(editing?.styles ?? []);
  const [seasons, setSeasons] = useState<SeasonId[]>(editing?.seasons ?? []);
  const [name, setName] = useState(editing?.name ?? '');
  const [brand, setBrand] = useState(editing?.brand ?? '');
  const [memo, setMemo] = useState(editing?.memo ?? '');
  const [look, setLook] = useState<ItemLook>(
    editing?.look ?? {
      template_id: defaultTemplateFor('tops').id,
      base_color: colorHex('black'),
      morphs: { length: 0, oversize: 0.45 },
    },
  );

  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const changeCategory = (c: CategoryId) => {
    setCategory(c);
    setLook((l) => ({ ...l, template_id: defaultTemplateFor(c).id }));
  };

  const save = () => {
    const data = {
      category, color, name, brand, memo,
      styles: styleTags, seasons, photoUri,
      isFavorite: editing?.isFavorite ?? false,
      look: { ...look, base_color: colorHex(color) },
    };
    if (editing) closet.update(editing.id, data);
    else closet.add(data);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
      <SectionLabel>写真</SectionLabel>
      <PhotoPicker uri={photoUri} onPick={setPhotoUri} />

      <SectionLabel>カテゴリ *</SectionLabel>
      <ChipRow
        options={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        value={category}
        onChange={changeCategory}
      />

      <SectionLabel>色 *</SectionLabel>
      <ColorPalette colors={COLORS} value={color} onChange={(c) => setColor(c as ColorId)} />

      <SectionLabel>系統（複数OK）</SectionLabel>
      <View style={styles.wrapRow}>
        <ChipRow options={STYLES} value={styleTags} multi onChange={(id) => setStyleTags((l) => toggle(l, id))} />
      </View>

      <SectionLabel>季節（複数OK）</SectionLabel>
      <ChipRow options={SEASONS} value={seasons} multi onChange={(id) => setSeasons((l) => toggle(l, id))} />

      <SectionLabel>アイテム名</SectionLabel>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="例: 白Tシャツ" placeholderTextColor={D.textSecondary} />
      <SectionLabel>ブランド</SectionLabel>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="例: UNIQLO" placeholderTextColor={D.textSecondary} />
      <SectionLabel>メモ</SectionLabel>
      <TextInput style={[styles.input, { height: 70 }]} value={memo} onChangeText={setMemo} multiline placeholderTextColor={D.textSecondary} />

      <LookEditor category={category} look={look} baseColorHex={colorHex(color)} onChange={setLook} />

      <PrimaryButton title={editing ? '更新する' : 'クローゼットに追加'} onPress={save} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  input: {
    backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: D.textPrimary,
  },
  wrapRow: {},
});
