import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { Chip, ChipRow, EmptyState, ItemCard, PrimaryButton } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { CATEGORIES, type CategoryId } from '@/constants/taxonomy';
import { seedDemoData } from '@/lib/seed';
import { useCloset } from '@/stores/closet';

export default function ClosetScreen() {
  const items = useCloset((s) => s.items);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [favOnly, setFavOnly] = useState(false);
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const cardW = (width - 16 * 2 - 10 * 2) / 3;

  const filtered = useMemo(() => {
    let list = items;
    if (category !== 'all') list = list.filter((i) => i.category === category);
    if (favOnly) list = list.filter((i) => i.isFavorite);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) =>
        [i.name, i.brand, i.memo].some((t) => t?.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [items, category, favOnly, query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="検索（名前・ブランド・メモ）"
          placeholderTextColor={D.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View style={styles.filterRow}>
        <ChipRow
          options={[{ id: 'all' as const, label: 'すべて' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))]}
          value={category}
          onChange={(id) => setCategory(id)}
        />
      </View>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row' }}>
        <Chip label="♥ お気に入り" selected={favOnly} onPress={() => setFavOnly((v) => !v)} />
      </View>

      {items.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title="クローゼットが空っぽ！"
          message="最初の1着を登録してみよう。お試しならデモデータもどうぞ。"
          action={
            <View style={{ gap: 10, width: 220 }}>
              <PrimaryButton title="服を登録する" onPress={() => router.push('/closet-form')} />
              <Pressable onPress={() => seedDemoData()}>
                <Text style={styles.seedLink}>デモデータを入れる</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 10, paddingVertical: 12, paddingBottom: 90 }}
          renderItem={({ item }) => (
            <ItemCard
              name={item.name || item.brand || 'アイテム'}
              photoUri={item.photoUri}
              colorId={item.color}
              favorite={item.isFavorite}
              width={cardW}
              onPress={() => router.push(`/item/${item.id}`)}
            />
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/closet-form')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  searchRow: { paddingHorizontal: 16, paddingTop: 8 },
  search: {
    backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: D.textPrimary,
  },
  filterRow: { paddingLeft: 16, paddingTop: 10 },
  seedLink: { color: D.textSecondary, textAlign: 'center', textDecorationLine: 'underline', fontSize: 13 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: D.accent, alignItems: 'center', justifyContent: 'center', elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 32 },
});
