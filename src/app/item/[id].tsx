import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip, ColorDot, GhostButton, PrimaryButton, SectionLabel } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { categoryLabel, colorLabel, SEASONS, styleLabel } from '@/constants/taxonomy';
import { useCloset } from '@/stores/closet';
import { useOutfits } from '@/stores/outfits';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const closet = useCloset();
  const outfits = useOutfits((s) => s.outfits);
  const item = closet.items.find((i) => i.id === id);

  if (!item) return null;

  const usedIn = outfits.filter((o) => o.items.some((r) => r.source === 'closet' && r.itemId === item.id));

  const confirmDelete = () => {
    Alert.alert('削除しますか？', `「${item.name || 'このアイテム'}」をクローゼットから削除します`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => { closet.remove(item.id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.photo}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 64 }}>👕</Text>
          )}
          <Pressable style={styles.favBtn} onPress={() => closet.toggleFavorite(item.id)}>
            <Text style={{ fontSize: 20, color: item.isFavorite ? D.danger : '#BBB' }}>♥</Text>
          </Pressable>
        </View>

        <View style={{ padding: 18 }}>
          <Text style={styles.name}>{item.name || 'アイテム'}</Text>
          {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}

          <View style={styles.metaRow}>
            <Chip label={categoryLabel(item.category)} />
            <View style={styles.colorChip}>
              <ColorDot colorId={item.color} />
              <Text style={styles.colorText}>{colorLabel(item.color)}</Text>
            </View>
          </View>

          {item.styles.length > 0 && (
            <>
              <SectionLabel>系統</SectionLabel>
              <View style={styles.wrapRow}>
                {item.styles.map((s) => <Chip key={s} label={styleLabel(s)} />)}
              </View>
            </>
          )}
          {item.seasons.length > 0 && (
            <>
              <SectionLabel>季節</SectionLabel>
              <View style={styles.wrapRow}>
                {item.seasons.map((s) => (
                  <Chip key={s} label={SEASONS.find((x) => x.id === s)?.label ?? s} />
                ))}
              </View>
            </>
          )}
          {item.memo ? (
            <>
              <SectionLabel>メモ</SectionLabel>
              <Text style={styles.memo}>{item.memo}</Text>
            </>
          ) : null}

          {usedIn.length > 0 && (
            <>
              <SectionLabel>このアイテムを使ったコーデ</SectionLabel>
              {usedIn.map((o) => (
                <Pressable key={o.id} style={styles.outfitRow} onPress={() => router.push(`/outfit/${o.id}`)}>
                  <Text style={{ fontSize: 14, color: D.textPrimary }}>✨ {o.name}</Text>
                </Pressable>
              ))}
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <GhostButton title="編集" onPress={() => router.push(`/closet-form?id=${item.id}`)} style={{ flex: 1 }} />
            <GhostButton title="削除" onPress={confirmDelete} style={{ flex: 1, borderColor: D.danger }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="着せてみる" onPress={() => router.push(`/try-on?wear=closet:${item.id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  photo: {
    height: 320, backgroundColor: '#F4F2EF', alignItems: 'center', justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFFE6', alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '800', color: D.textPrimary },
  brand: { fontSize: 13, color: D.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  colorChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: D.border, backgroundColor: D.surface,
  },
  colorText: { fontSize: 13, color: D.textPrimary },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memo: { fontSize: 14, color: D.textPrimary, lineHeight: 21 },
  outfitRow: {
    backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, borderRadius: 12,
    padding: 13, marginBottom: 8,
  },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 28,
    backgroundColor: D.bg, borderTopWidth: 1, borderTopColor: D.border,
  },
});
