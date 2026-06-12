import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { AvatarViewer } from '@/components/three/AvatarViewer';
import { Chip, PrimaryButton } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { CATEGORIES, SCENES, type CategoryId, type SceneId } from '@/constants/taxonomy';
import { useAvatar } from '@/stores/avatar';
import { useCloset } from '@/stores/closet';
import { useOutfits } from '@/stores/outfits';
import { useTryOn } from '@/stores/tryon';
import { useWishlist } from '@/stores/wishlist';
import type { OutfitItemRef } from '@/types';

export default function TryOnScreen() {
  const params = useLocalSearchParams<{ wear?: string; outfit?: string }>();
  const avatar = useAvatar((s) => s.config);
  const closet = useCloset((s) => s.items);
  const wishes = useWishlist((s) => s.items);
  const recordTryOn = useWishlist((s) => s.recordTryOn);
  const outfits = useOutfits((s) => s.outfits);
  const addOutfit = useOutfits((s) => s.add);
  const tryon = useTryOn();

  const [category, setCategory] = useState<CategoryId>('tops');
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [scene, setScene] = useState<SceneId | undefined>();

  // ディープリンク: ?wear=closet:id / wishlist:id、?outfit=id
  useEffect(() => {
    if (params.wear) {
      const [source, id] = params.wear.split(':') as ['closet' | 'wishlist', string];
      const item = source === 'closet' ? closet.find((i) => i.id === id) : wishes.find((i) => i.id === id);
      if (item) {
        tryon.wear(item.category, { source, itemId: item.id, look: item.look });
        setCategory(item.category);
        if (source === 'wishlist') recordTryOn(id);
      }
    }
    if (params.outfit) {
      const outfit = outfits.find((o) => o.id === params.outfit);
      if (outfit) {
        tryon.loadItems(
          outfit.items
            .map((ref) => {
              const item = ref.source === 'closet'
                ? closet.find((i) => i.id === ref.itemId)
                : wishes.find((i) => i.id === ref.itemId);
              return item ? { slot: ref.slot, item: { source: ref.source, itemId: item.id, look: item.look } } : null;
            })
            .filter((e): e is NonNullable<typeof e> => e !== null),
        );
      }
    }
    // 初回マウント時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closetItems = useMemo(() => closet.filter((i) => i.category === category), [closet, category]);
  const wishItems = useMemo(
    () => wishes.filter((i) => i.category === category && (i.status === 'want' || i.status === 'hold')),
    [wishes, category],
  );

  const wornInCategory = tryon.slots[category];
  const wornCount = Object.keys(tryon.slots).length;

  const randomize = () => {
    tryon.reset();
    const slots: CategoryId[] = Math.random() > 0.3 ? ['tops', 'bottoms', 'shoes'] : ['onepiece', 'shoes'];
    for (const slot of slots) {
      const pool = closet.filter((i) => i.category === slot);
      if (pool.length > 0) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        tryon.wear(slot, { source: 'closet', itemId: item.id, look: item.look });
      }
    }
  };

  const save = () => {
    const items: OutfitItemRef[] = Object.entries(tryon.slots).map(([slot, worn]) => ({
      slot: slot as CategoryId,
      source: worn.source,
      itemId: worn.itemId,
    }));
    addOutfit({ name: name.trim() || '新しいコーデ', scene, seasons: [], items });
    setSaveOpen(false);
    setName('');
    router.back();
  };

  const renderItemThumb = (item: { id: string; name: string; photoUri?: string }, source: 'closet' | 'wishlist') => {
    const isWorn = wornInCategory?.itemId === item.id;
    const full = source === 'closet' ? closet.find((i) => i.id === item.id)! : wishes.find((i) => i.id === item.id)!;
    return (
      <Pressable
        key={item.id}
        style={[styles.thumb, isWorn && styles.thumbWorn]}
        onPress={() => {
          if (isWorn) {
            tryon.removeSlot(category);
          } else {
            tryon.wear(category, { source, itemId: item.id, look: full.look });
            if (source === 'wishlist') recordTryOn(item.id);
          }
        }}
      >
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbImg, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={[styles.lookDot, { backgroundColor: full.look.base_color }]} />
          </View>
        )}
        {source === 'wishlist' && (
          <View style={styles.wishBadge}><Text style={styles.wishBadgeText}>検討中</Text></View>
        )}
        <Text style={styles.thumbName} numberOfLines={1}>{item.name || 'アイテム'}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewerWrap}>
        <AvatarViewer config={avatar} worn={tryon.slots} mode="tryon" />
        <Text style={styles.hint}>ドラッグで回転</Text>
        {wornCount > 0 && (
          <Pressable style={styles.resetBtn} onPress={() => tryon.reset()}>
            <Text style={styles.resetText}>リセット</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.panel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.catBtn, category === c.id && styles.catBtnActive]}
              onPress={() => setCategory(c.id)}
            >
              <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
              {tryon.slots[c.id] && <View style={styles.catDot} />}
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemRow}>
          {closetItems.length === 0 && wishItems.length === 0 ? (
            <Text style={styles.emptyText}>このカテゴリの服はまだありません</Text>
          ) : (
            <>
              {closetItems.map((i) => renderItemThumb(i, 'closet'))}
              {wishItems.length > 0 && <View style={styles.divider} />}
              {wishItems.map((i) => renderItemThumb(i, 'wishlist'))}
            </>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable style={styles.diceBtn} onPress={randomize}>
            <Text style={{ fontSize: 22 }}>🎲</Text>
          </Pressable>
          <PrimaryButton
            title="コーデを保存"
            onPress={() => setSaveOpen(true)}
            disabled={wornCount === 0}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <Modal visible={saveOpen} transparent animationType="slide" onRequestClose={() => setSaveOpen(false)}>
        <Pressable style={styles.sheetBg} onPress={() => setSaveOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>コーデを保存</Text>
            <TextInput
              style={styles.input}
              placeholder="コーデ名（例: 週末カフェコーデ）"
              placeholderTextColor={D.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.sheetLabel}>シーン</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SCENES.map((s) => (
                <Chip
                  key={s.id}
                  label={s.label}
                  selected={scene === s.id}
                  onPress={() => setScene(scene === s.id ? undefined : s.id)}
                />
              ))}
            </View>
            <PrimaryButton title="保存する" onPress={save} style={{ marginTop: 18 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1EEE9' },
  viewerWrap: { flex: 1 },
  hint: { position: 'absolute', top: 10, alignSelf: 'center', fontSize: 11, color: D.textSecondary },
  resetBtn: {
    position: 'absolute', top: 8, right: 12, backgroundColor: '#FFFFFFD9',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: D.border,
  },
  resetText: { fontSize: 12, fontWeight: '600', color: D.textPrimary },
  panel: {
    backgroundColor: D.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 10, paddingBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: -3 },
  },
  catRow: { paddingHorizontal: 14, gap: 4 },
  catBtn: { padding: 10, borderRadius: 12, alignItems: 'center' },
  catBtnActive: { backgroundColor: '#F1EEE9' },
  catDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: D.accent, marginTop: 2 },
  itemRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 10, alignItems: 'center' },
  thumb: { width: 78 },
  thumbWorn: { transform: [{ scale: 0.96 }], opacity: 0.95 },
  thumbImg: { width: 78, height: 78, borderRadius: 12, backgroundColor: '#F4F2EF', overflow: 'hidden' },
  lookDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: D.border },
  thumbName: { fontSize: 10, color: D.textSecondary, marginTop: 3 },
  wishBadge: {
    position: 'absolute', top: 4, left: 4, backgroundColor: '#111111B3',
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6,
  },
  wishBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '700' },
  divider: { width: 1, height: 60, backgroundColor: D.border, marginHorizontal: 4 },
  emptyText: { fontSize: 13, color: D.textSecondary, paddingVertical: 28 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, alignItems: 'center' },
  diceBtn: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: D.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: D.surface,
  },
  sheetBg: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: D.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 20, paddingBottom: 36,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: D.textPrimary, marginBottom: 14 },
  sheetLabel: { fontSize: 13, fontWeight: '700', color: D.textSecondary, marginTop: 14, marginBottom: 8 },
  input: {
    backgroundColor: D.bg, borderWidth: 1, borderColor: D.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: D.textPrimary,
  },
});
