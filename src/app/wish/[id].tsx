import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GhostButton, ItemCard, PrimaryButton, ScoreBadge, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { WISH_STATUSES, categoryLabel, type WishStatus } from '@/constants/taxonomy';
import { getCompatibility } from '@/lib/compatibility';
import { useCloset } from '@/stores/closet';
import { useWishlist } from '@/stores/wishlist';

export default function WishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wishlist = useWishlist();
  const closet = useCloset();
  const item = wishlist.items.find((i) => i.id === id);

  if (!item) return null;

  const compat = getCompatibility(item, closet.items);

  const setStatus = (status: WishStatus) => {
    wishlist.setStatus(item.id, status);
    if (status === 'bought') {
      Alert.alert('クローゼットに移動しますか？', '買った服を手持ち服として登録します', [
        { text: 'あとで', style: 'cancel' },
        {
          text: '移動する',
          onPress: () => {
            closet.add({
              category: item.category,
              name: item.name,
              brand: item.brand,
              color: item.color,
              styles: [],
              seasons: [],
              memo: item.memo,
              isFavorite: false,
              photoUri: item.photoUri,
              look: item.look,
              sourceWishlistId: item.id,
            });
            router.back();
          },
        },
      ]);
    }
  };

  const confirmDelete = () => {
    Alert.alert('削除しますか？', undefined, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => { wishlist.remove(item.id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.photo}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 64 }}>🧥</Text>
          )}
        </View>

        <View style={{ padding: 18 }}>
          <Text style={styles.name}>{item.name || '気になる服'}</Text>
          <Text style={styles.meta}>
            {[item.brand, categoryLabel(item.category)].filter(Boolean).join(' · ')}
          </Text>
          {item.price != null && <Text style={styles.price}>¥{item.price.toLocaleString()}</Text>}
          {item.url ? (
            <Pressable onPress={() => Linking.openURL(item.url!)}>
              <Text style={styles.link}>🔗 商品ページを開く</Text>
            </Pressable>
          ) : null}

          <SectionLabel>ステータス</SectionLabel>
          <View style={styles.statusRow}>
            {WISH_STATUSES.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.statusBtn, item.status === s.id && styles.statusBtnActive]}
                onPress={() => setStatus(s.id)}
              >
                <Text style={[styles.statusText, item.status === s.id && styles.statusTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 相性サマリー */}
          {closet.items.length > 0 && (
            <Pressable style={styles.compatCard} onPress={() => router.push(`/compat/${item.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ScoreBadge score={compat.score} />
                <Text style={styles.compatVerdict}>買うべき度: {compat.verdict}</Text>
              </View>
              <Text style={styles.compatReason} numberOfLines={2}>{compat.reason}</Text>
              {compat.topMatches.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {compat.topMatches.slice(0, 3).map((m) => (
                    <ItemCard
                      key={m.id}
                      name={m.name || 'アイテム'}
                      photoUri={m.photoUri}
                      colorId={m.color}
                      width={78}
                      onPress={() => router.push(`/item/${m.id}`)}
                    />
                  ))}
                </View>
              )}
              <Text style={styles.compatMore}>くわしく見る ▸</Text>
            </Pressable>
          )}

          {item.tryOnCount > 0 && (
            <Text style={styles.tryCount}>これまでに {item.tryOnCount} 回試着しました</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <GhostButton title="編集" onPress={() => router.push(`/wish-form?id=${item.id}`)} style={{ flex: 1 }} />
            <GhostButton title="削除" onPress={confirmDelete} style={{ flex: 1, borderColor: D.danger }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="仮試着する" onPress={() => router.push(`/try-on?wear=wishlist:${item.id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  photo: { height: 300, backgroundColor: '#F4F2EF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '800', color: D.textPrimary },
  meta: { fontSize: 13, color: D.textSecondary, marginTop: 2 },
  price: { fontSize: 18, fontWeight: '800', color: D.textPrimary, marginTop: 6 },
  link: { fontSize: 13, color: '#4A7BC8', marginTop: 8 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: D.border,
    alignItems: 'center', backgroundColor: D.surface,
  },
  statusBtnActive: { backgroundColor: D.accent, borderColor: D.accent },
  statusText: { fontSize: 12, color: D.textPrimary },
  statusTextActive: { color: '#FFF', fontWeight: '700' },
  compatCard: {
    marginTop: 20, backgroundColor: D.surface, borderRadius: D.radiusCard,
    borderWidth: 1, borderColor: D.border, padding: 14,
  },
  compatVerdict: { fontSize: 15, fontWeight: '800', color: D.textPrimary },
  compatReason: { fontSize: 12, color: D.textSecondary, marginTop: 8, lineHeight: 18 },
  compatMore: { fontSize: 12, fontWeight: '700', color: D.textPrimary, marginTop: 10, textAlign: 'right' },
  tryCount: { fontSize: 12, color: D.textSecondary, marginTop: 14 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 28,
    backgroundColor: D.bg, borderTopWidth: 1, borderTopColor: D.border,
  },
});
