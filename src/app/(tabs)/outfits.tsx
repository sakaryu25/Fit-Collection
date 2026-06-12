import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorDot, EmptyState, PrimaryButton } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { SCENES } from '@/constants/taxonomy';
import { useCloset } from '@/stores/closet';
import { useOutfits } from '@/stores/outfits';
import { useWishlist } from '@/stores/wishlist';

export default function OutfitsScreen() {
  const outfits = useOutfits((s) => s.outfits);
  const closet = useCloset((s) => s.items);
  const wishes = useWishlist((s) => s.items);

  const itemOf = (source: 'closet' | 'wishlist', id: string) =>
    source === 'closet' ? closet.find((i) => i.id === id) : wishes.find((i) => i.id === id);

  if (outfits.length === 0) {
    return (
      <EmptyState
        emoji="✨"
        title="まだコーデがありません"
        message="着せ替えでコーデを作って保存してみよう"
        action={<PrimaryButton title="着せ替えをはじめる" onPress={() => router.push('/try-on')} style={{ width: 220 }} />}
      />
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: D.bg }}
      data={outfits}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item: outfit }) => {
        const sceneLabel = SCENES.find((s) => s.id === outfit.scene)?.label;
        const hasWish = outfit.items.some((i) => i.source === 'wishlist');
        return (
          <Pressable style={styles.card} onPress={() => router.push(`/outfit/${outfit.id}`)}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{outfit.name}</Text>
              {sceneLabel ? <Text style={styles.scene}>{sceneLabel}</Text> : null}
            </View>
            <View style={styles.itemsRow}>
              {outfit.items.map((ref) => {
                const it = itemOf(ref.source, ref.itemId);
                if (!it) return null;
                return (
                  <View key={`${ref.slot}-${ref.itemId}`} style={styles.itemPill}>
                    <ColorDot colorId={it.color} size={10} />
                    <Text style={styles.itemPillText} numberOfLines={1}>
                      {it.name || it.brand || ref.slot}
                    </Text>
                  </View>
                );
              })}
            </View>
            {hasWish ? <Text style={styles.wishNote}>🏷 検討中アイテムを含む</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: D.surface, borderRadius: D.radiusCard, borderWidth: 1,
    borderColor: D.border, padding: 14, gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: D.textPrimary },
  scene: {
    fontSize: 11, color: D.textSecondary, backgroundColor: D.bg,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden',
  },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: D.bg,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, maxWidth: 150,
  },
  itemPillText: { fontSize: 12, color: D.textPrimary },
  wishNote: { fontSize: 11, color: D.textSecondary },
});
