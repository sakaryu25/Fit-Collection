import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoomScene } from '@/components/three/RoomScene';
import { ItemCard } from '@/components/ui/kit';
import { D } from '@/constants/design';
import { useAvatar } from '@/stores/avatar';
import { useCloset } from '@/stores/closet';
import { useOutfits } from '@/stores/outfits';
import { useWishlist } from '@/stores/wishlist';
import { useTryOn } from '@/stores/tryon';

export default function RoomScreen() {
  const avatar = useAvatar();
  const closetCount = useCloset((s) => s.items.length);
  const outfitCount = useOutfits((s) => s.outfits.length);
  const wishes = useWishlist((s) => s.items);
  const worn = useTryOn((s) => s.slots);

  const wants = useMemo(
    () => wishes.filter((w) => w.status === 'want' || w.status === 'hold').slice(0, 6),
    [wishes],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Fit Collection</Text>
        <Pressable onPress={() => router.push('/avatar-creator')}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.roomWrap}>
        <RoomScene config={avatar.config} worn={worn} />

        {/* タップ導線オーバーレイ */}
        <Pressable style={[styles.hotspot, { left: 12, top: '18%' }]} onPress={() => router.push('/closet')}>
          <Text style={styles.hotspotText}>🚪 クローゼット</Text>
        </Pressable>
        <Pressable style={[styles.hotspot, { right: 12, top: '24%' }]} onPress={() => router.push('/try-on')}>
          <Text style={styles.hotspotText}>🪞 着せ替え</Text>
        </Pressable>
        <Pressable
          style={[styles.hotspot, { alignSelf: 'center', bottom: 14 }]}
          onPress={() => router.push('/avatar-creator')}
        >
          <Text style={styles.hotspotText}>🧍 アバター編集</Text>
        </Pressable>

        {!avatar.created && (
          <Pressable style={styles.welcome} onPress={() => router.push('/avatar-creator')}>
            <Text style={styles.welcomeTitle}>ようこそ！</Text>
            <Text style={styles.welcomeText}>まずは自分っぽいアバターを{'\n'}作ってみよう</Text>
            <View style={styles.welcomeBtn}>
              <Text style={styles.welcomeBtnText}>アバターを作る</Text>
            </View>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.bottom} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.summaryRow}>
          <Pressable style={styles.summaryCard} onPress={() => router.push('/closet')}>
            <Text style={styles.summaryEmoji}>👕</Text>
            <Text style={styles.summaryNum}>{closetCount}<Text style={styles.summaryUnit}> 着</Text></Text>
            <Text style={styles.summaryLabel}>クローゼット</Text>
          </Pressable>
          <Pressable style={styles.summaryCard} onPress={() => router.push('/outfits')}>
            <Text style={styles.summaryEmoji}>✨</Text>
            <Text style={styles.summaryNum}>{outfitCount}<Text style={styles.summaryUnit}> 件</Text></Text>
            <Text style={styles.summaryLabel}>コーデ</Text>
          </Pressable>
        </View>

        {wants.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>最近の検討中 ▸</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
              {wants.map((w) => (
                <ItemCard
                  key={w.id}
                  name={w.name || w.brand || '気になる服'}
                  photoUri={w.photoUri}
                  colorId={w.color}
                  badge="検討中"
                  width={100}
                  onPress={() => router.push(`/wish/${w.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/closet-form')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
  },
  logo: { fontSize: 18, fontWeight: '800', color: D.textPrimary, letterSpacing: 0.5 },
  roomWrap: {
    flex: 1, marginHorizontal: 14, borderRadius: D.radiusCard, overflow: 'hidden',
    backgroundColor: '#EFEAE2', minHeight: 320,
  },
  hotspot: {
    position: 'absolute', backgroundColor: '#FFFFFFE6', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: D.border,
  },
  hotspotText: { fontSize: 12, fontWeight: '700', color: D.textPrimary },
  welcome: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#111111AA', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  welcomeTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  welcomeText: { color: '#FFFFFFDD', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  welcomeBtn: {
    marginTop: 10, backgroundColor: '#FFF', paddingHorizontal: 22, paddingVertical: 12,
    borderRadius: D.radiusButton,
  },
  welcomeBtnText: { fontWeight: '800', color: D.textPrimary },
  bottom: { maxHeight: 200, marginTop: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: D.surface, borderRadius: D.radiusCard, borderWidth: 1,
    borderColor: D.border, padding: 14, gap: 2,
  },
  summaryEmoji: { fontSize: 18 },
  summaryNum: { fontSize: 22, fontWeight: '800', color: D.textPrimary },
  summaryUnit: { fontSize: 13, fontWeight: '600', color: D.textSecondary },
  summaryLabel: { fontSize: 12, color: D.textSecondary },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: D.textSecondary, marginLeft: 16, marginBottom: 8 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: D.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 32 },
});
