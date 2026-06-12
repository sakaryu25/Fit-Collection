import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { LookEditor, PhotoPicker } from '@/components/ui/ItemFormShared';
import { ChipRow, ColorPalette, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { defaultTemplateFor } from '@/constants/templates';
import {
  CATEGORIES, COLORS, WISH_STATUSES, colorHex,
  type CategoryId, type ColorId, type WishStatus,
} from '@/constants/taxonomy';
import { useWishlist } from '@/stores/wishlist';
import type { ItemLook } from '@/types';

export default function WishFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const wishlist = useWishlist();
  const editing = id ? wishlist.items.find((i) => i.id === id) : undefined;

  const [photoUri, setPhotoUri] = useState(editing?.photoUri);
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'tops');
  const [color, setColor] = useState<ColorId>(editing?.color ?? 'black');
  const [name, setName] = useState(editing?.name ?? '');
  const [brand, setBrand] = useState(editing?.brand ?? '');
  const [price, setPrice] = useState(editing?.price != null ? String(editing.price) : '');
  const [url, setUrl] = useState(editing?.url ?? '');
  const [memo, setMemo] = useState(editing?.memo ?? '');
  const [status, setStatus] = useState<WishStatus>(editing?.status ?? 'want');
  const [look, setLook] = useState<ItemLook>(
    editing?.look ?? {
      template_id: defaultTemplateFor('tops').id,
      base_color: colorHex('black'),
      morphs: { length: 0, oversize: 0.45 },
    },
  );

  const changeCategory = (c: CategoryId) => {
    setCategory(c);
    setLook((l) => ({ ...l, template_id: defaultTemplateFor(c).id }));
  };

  const save = () => {
    const data = {
      category, color, name, brand, memo, url, status,
      price: price.trim() ? Number(price.replace(/[^\d]/g, '')) : undefined,
      photoUri,
      look: { ...look, base_color: colorHex(color) },
    };
    if (editing) wishlist.update(editing.id, data);
    else wishlist.add(data);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
      <SectionLabel>写真・スクショ</SectionLabel>
      <PhotoPicker uri={photoUri} onPick={setPhotoUri} />

      <SectionLabel>カテゴリ *</SectionLabel>
      <ChipRow
        options={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        value={category}
        onChange={changeCategory}
      />

      <SectionLabel>色 *</SectionLabel>
      <ColorPalette colors={COLORS} value={color} onChange={(c) => setColor(c as ColorId)} />

      <SectionLabel>ステータス</SectionLabel>
      <ChipRow options={WISH_STATUSES} value={status} onChange={setStatus} />

      <SectionLabel>商品名</SectionLabel>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="例: レザージャケット" placeholderTextColor={D.textSecondary} />
      <SectionLabel>ブランド</SectionLabel>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="例: ZARA" placeholderTextColor={D.textSecondary} />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <SectionLabel>値段（円）</SectionLabel>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="12990" placeholderTextColor={D.textSecondary} />
        </View>
      </View>
      <SectionLabel>商品URL</SectionLabel>
      <TextInput style={styles.input} value={url} onChangeText={setUrl} autoCapitalize="none" placeholder="https://..." placeholderTextColor={D.textSecondary} />
      <SectionLabel>メモ</SectionLabel>
      <TextInput style={[styles.input, { height: 70 }]} value={memo} onChangeText={setMemo} multiline placeholderTextColor={D.textSecondary} />

      <LookEditor category={category} look={look} baseColorHex={colorHex(color)} onChange={setLook} />

      <PrimaryButton title={editing ? '更新する' : 'リストに追加'} onPress={save} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  input: {
    backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: D.textPrimary,
  },
  row2: { flexDirection: 'row', gap: 12 },
});
