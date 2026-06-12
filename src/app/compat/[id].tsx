import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ItemCard, PrimaryButton, ScoreRing, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { categoryLabel } from '@/constants/taxonomy';
import { getCompatibility } from '@/lib/compatibility';
import { useCloset } from '@/stores/closet';
import { useTryOn } from '@/stores/tryon';
import { useWishlist } from '@/stores/wishlist';
import type { Slot } from '@/types';

export default function CompatibilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wish = useWishlist((s) => s.items.find((i) => i.id === id));
  const recordTryOn = useWishlist((s) => s.recordTryOn);
  const closet = useCloset((s) => s.items);
  const loadItems = useTryOn((s) => s.loadItems);

  if (!wish) return null;

  const compat = getCompatibility(wish, closet);
  const suggested = Object.entries(compat.suggestedOutfit) as [Slot, (typeof closet)[number]][];

  const tryCombo = () => {
    loadItems([
      { slot: wish.category, item: { source: 'wishlist', itemId: wish.id, look: wish.look } },
      ...suggested.map(([slot, item]) => ({
        slot,
        item: { source: 'closet' as const, itemId: item.id, look: item.look },
      })),
    ]);
    recordTryOn(wish.id);
    router.push('/try-on');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <Text style={styles.title}>この{categoryLabel(wish.category)}、買い？</Text>

      <View style={{ alignItems: 'center', marginVertical: 18, gap: 10 }}>
        <ScoreRing score={compat.score} />
        <Text style={styles.verdict}>買うべき度: {compat.verdict}</Text>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Text key={n} style={{ fontSize: 16, opacity: n <= compat.versatility ? 1 : 0.25 }}>★</Text>
          ))}
          <Text style={styles.versatilityLabel}>  着回ししやすさ</Text>
        </View>
      </View>

      <Text style={styles.reason}>{compat.reason}</Text>

      {compat.topMatches.length > 0 && (
        <>
          <SectionLabel>合わせやすい手持ち服 TOP{Math.min(5, compat.topMatches.length)}</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {compat.topMatches.map((m) => (
              <ItemCard
                key={m.id}
                name={m.name || 'アイテム'}
                photoUri={m.photoUri}
                colorId={m.color}
                width={92}
                onPress={() => router.push(`/item/${m.id}`)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {suggested.length > 0 && (
        <>
          <SectionLabel>おすすめコーデ例</SectionLabel>
          <View style={styles.suggestCard}>
            <Text style={styles.suggestText}>
              {[wish.name || `この${categoryLabel(wish.category)}`, ...suggested.map(([, i]) => i.name || categoryLabel(i.category))].join(' + ')}
            </Text>
            <PrimaryButton title="この組み合わせを試着する" onPress={tryCombo} style={{ marginTop: 12 }} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  title: { fontSize: 21, fontWeight: '800', color: D.textPrimary, textAlign: 'center' },
  verdict: { fontSize: 16, fontWeight: '800', color: D.textPrimary },
  versatilityLabel: { fontSize: 12, color: D.textSecondary, alignSelf: 'center' },
  reason: {
    fontSize: 14, color: D.textPrimary, lineHeight: 22, backgroundColor: D.surface,
    borderRadius: D.radiusCard, borderWidth: 1, borderColor: D.border, padding: 14,
  },
  suggestCard: {
    backgroundColor: D.surface, borderRadius: D.radiusCard, borderWidth: 1,
    borderColor: D.border, padding: 14,
  },
  suggestText: { fontSize: 14, color: D.textPrimary, lineHeight: 21 },
});
