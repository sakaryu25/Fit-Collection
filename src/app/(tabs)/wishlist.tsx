import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PrimaryButton, ScoreBadge } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { WISH_STATUSES, categoryLabel, type WishStatus } from '@/constants/taxonomy';
import { getCompatibility } from '@/lib/compatibility';
import { useCloset } from '@/stores/closet';
import { useWishlist } from '@/stores/wishlist';

export default function WishlistScreen() {
  const items = useWishlist((s) => s.items);
  const closet = useCloset((s) => s.items);
  const [status, setStatus] = useState<WishStatus>('want');

  const filtered = useMemo(() => items.filter((i) => i.status === status), [items, status]);

  return (
    <View style={styles.container}>
      <View style={styles.segment}>
        {WISH_STATUSES.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.segmentBtn, status === s.id && styles.segmentBtnActive]}
            onPress={() => setStatus(s.id)}
          >
            <Text style={[styles.segmentText, status === s.id && styles.segmentTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title={items.length === 0 ? '気になる服を集めよう' : 'このステータスの服はありません'}
          message="ECのスクショや店頭の写真から登録して、買う前にアバターで試着できます"
          action={items.length === 0 ? (
            <PrimaryButton title="気になる服を登録" onPress={() => router.push('/wish-form')} style={{ width: 220 }} />
          ) : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 90 }}
          renderItem={({ item }) => {
            const compat = getCompatibility(item, closet);
            return (
              <Pressable style={styles.card} onPress={() => router.push(`/wish/${item.id}`)}>
                <View style={styles.thumb}>
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 28 }}>🧥</Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.name} numberOfLines={1}>{item.name || '気になる服'}</Text>
                  <Text style={styles.meta}>
                    {[item.brand, categoryLabel(item.category)].filter(Boolean).join(' · ')}
                  </Text>
                  {item.price != null ? <Text style={styles.price}>¥{item.price.toLocaleString()}</Text> : null}
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    {closet.length > 0 && <ScoreBadge score={compat.score} />}
                    {item.tryOnCount > 0 && <Text style={styles.tryCount}>試着 {item.tryOnCount}回</Text>}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/wish-form')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  segment: {
    flexDirection: 'row', margin: 16, marginBottom: 4, backgroundColor: '#EFEDE9',
    borderRadius: 12, padding: 3,
  },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: D.surface },
  segmentText: { fontSize: 13, color: D.textSecondary },
  segmentTextActive: { color: D.textPrimary, fontWeight: '700' },
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: D.surface, borderRadius: D.radiusCard,
    borderWidth: 1, borderColor: D.border, padding: 12,
  },
  thumb: {
    width: 84, height: 84, borderRadius: 12, backgroundColor: '#F4F2EF',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  name: { fontSize: 15, fontWeight: '700', color: D.textPrimary },
  meta: { fontSize: 12, color: D.textSecondary },
  price: { fontSize: 14, fontWeight: '700', color: D.textPrimary },
  tryCount: { fontSize: 11, color: D.textSecondary },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: D.accent, alignItems: 'center', justifyContent: 'center', elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 32 },
});
