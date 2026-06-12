import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GhostButton, ItemCard, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { SCENES, categoryLabel } from '@/constants/taxonomy';
import { useCloset } from '@/stores/closet';
import { useOutfits } from '@/stores/outfits';
import { useWishlist } from '@/stores/wishlist';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const outfits = useOutfits();
  const closet = useCloset((s) => s.items);
  const wishes = useWishlist((s) => s.items);
  const outfit = outfits.outfits.find((o) => o.id === id);

  if (!outfit) return null;

  const sceneLabel = SCENES.find((s) => s.id === outfit.scene)?.label;

  const resolved = outfit.items
    .map((ref) => {
      const item = ref.source === 'closet'
        ? closet.find((i) => i.id === ref.itemId)
        : wishes.find((i) => i.id === ref.itemId);
      return item ? { ref, item } : null;
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const confirmDelete = () => {
    Alert.alert('このコーデを削除しますか？', undefined, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => { outfits.remove(outfit.id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>
        <Text style={styles.name}>{outfit.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {sceneLabel ? <Text style={styles.tag}>{sceneLabel}</Text> : null}
          <Text style={styles.date}>{new Date(outfit.createdAt).toLocaleDateString('ja-JP')}</Text>
        </View>
        {outfit.memo ? <Text style={styles.memo}>{outfit.memo}</Text> : null}

        <SectionLabel>使用アイテム</SectionLabel>
        <View style={styles.grid}>
          {resolved.map(({ ref, item }) => (
            <ItemCard
              key={`${ref.slot}-${ref.itemId}`}
              name={item.name || categoryLabel(ref.slot)}
              photoUri={item.photoUri}
              colorId={item.color}
              badge={ref.source === 'wishlist' ? '検討中' : undefined}
              width={104}
              onPress={() =>
                router.push(ref.source === 'closet' ? `/item/${item.id}` : `/wish/${item.id}`)
              }
            />
          ))}
        </View>

        <GhostButton title="削除" onPress={confirmDelete} style={{ marginTop: 26, borderColor: D.danger }} />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="このコーデを着せる" onPress={() => router.push(`/try-on?outfit=${outfit.id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  name: { fontSize: 21, fontWeight: '800', color: D.textPrimary },
  tag: {
    fontSize: 12, color: D.textPrimary, backgroundColor: D.surface, borderWidth: 1,
    borderColor: D.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden',
  },
  date: { fontSize: 12, color: D.textSecondary, alignSelf: 'center' },
  memo: { fontSize: 14, color: D.textPrimary, marginTop: 12, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 28,
    backgroundColor: D.bg, borderTopWidth: 1, borderTopColor: D.border,
  },
});
