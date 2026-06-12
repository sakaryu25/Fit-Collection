import React from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, View,
  type StyleProp, type ViewStyle,
} from 'react-native';

import { D } from '@/constants/design';
import { colorHex } from '@/constants/taxonomy';

// ---------- ボタン ----------
export function PrimaryButton({ title, onPress, disabled, style }: {
  title: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.primaryBtn, disabled && { opacity: 0.35 }, pressed && { opacity: 0.8 }, style,
      ]}
    >
      <Text style={s.primaryBtnText}>{title}</Text>
    </Pressable>
  );
}

export function GhostButton({ title, onPress, style }: {
  title: string; onPress: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.ghostBtn, pressed && { opacity: 0.6 }, style]}
    >
      <Text style={s.ghostBtnText}>{title}</Text>
    </Pressable>
  );
}

// ---------- チップ ----------
export function Chip({ label, selected, onPress }: {
  label: string; selected?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, selected && s.chipSelected]}
    >
      <Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow<T extends string>({ options, value, onChange, multi }: {
  options: { id: T; label: string }[];
  value: T | T[] | undefined;
  onChange: (id: T) => void;
  multi?: boolean;
}) {
  const isSel = (id: T) => (multi ? (value as T[] | undefined)?.includes(id) : value === id);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
      {options.map((o) => (
        <Chip key={o.id} label={o.label} selected={!!isSel(o.id)} onPress={() => onChange(o.id)} />
      ))}
    </ScrollView>
  );
}

// ---------- 色パレット ----------
export function ColorPalette({ colors, value, onChange, size = 34 }: {
  colors: { id: string; hex: string }[] | string[];
  value?: string;
  onChange: (id: string) => void;
  size?: number;
}) {
  const list = colors.map((c) => (typeof c === 'string' ? { id: c, hex: c } : c));
  return (
    <View style={s.palette}>
      {list.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onChange(c.id)}
          style={[
            s.swatch,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: c.hex },
            value === c.id && s.swatchSelected,
          ]}
        />
      ))}
    </View>
  );
}

export function ColorDot({ colorId, size = 12 }: { colorId: string; size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colorHex(colorId), borderWidth: 1, borderColor: D.border,
      }}
    />
  );
}

// ---------- アイテムカード ----------
export function ItemCard({ name, photoUri, colorId, badge, favorite, onPress, width }: {
  name: string; photoUri?: string; colorId?: string; badge?: string;
  favorite?: boolean; onPress: () => void; width: number;
}) {
  return (
    <Pressable onPress={onPress} style={[s.card, { width }]}>
      <View style={[s.cardImage, { width: width - 2, height: width - 2 }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: width * 0.3 }}>👕</Text>
        )}
        {badge ? (
          <View style={s.badge}><Text style={s.badgeText}>{badge}</Text></View>
        ) : null}
        {favorite ? <Text style={s.favStar}>♥</Text> : null}
      </View>
      <View style={s.cardMeta}>
        {colorId ? <ColorDot colorId={colorId} /> : null}
        <Text style={s.cardName} numberOfLines={1}>{name}</Text>
      </View>
    </Pressable>
  );
}

// ---------- スコア ----------
export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const color = score >= 65 ? D.scoreGood : score >= 50 ? D.scoreMid : D.danger;
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: size * 0.07, borderColor: color,
        alignItems: 'center', justifyContent: 'center', backgroundColor: D.surface,
      }}
    >
      <Text style={{ fontSize: size * 0.3, fontWeight: '800', color: D.textPrimary }}>{score}</Text>
      <Text style={{ fontSize: size * 0.1, color: D.textSecondary }}>点</Text>
    </View>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65 ? D.scoreGood : score >= 50 ? D.scoreMid : D.danger;
  return (
    <View style={[s.scoreBadge, { backgroundColor: color }]}>
      <Text style={s.scoreBadgeText}>{score}点</Text>
    </View>
  );
}

// ---------- 空状態 ----------
export function EmptyState({ emoji, title, message, action }: {
  emoji: string; title: string; message?: string; action?: React.ReactNode;
}) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {message ? <Text style={s.emptyMessage}>{message}</Text> : null}
      {action}
    </View>
  );
}

// ---------- セクション ----------
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

const s = StyleSheet.create({
  primaryBtn: {
    backgroundColor: D.accent, borderRadius: D.radiusButton,
    paddingVertical: 15, alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ghostBtn: {
    borderWidth: 1.5, borderColor: D.accent, borderRadius: D.radiusButton,
    paddingVertical: 13, alignItems: 'center',
  },
  ghostBtnText: { color: D.accent, fontSize: 15, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, marginRight: 8,
  },
  chipSelected: { backgroundColor: D.accent, borderColor: D.accent },
  chipText: { fontSize: 13, color: D.textPrimary },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  chipRow: { paddingVertical: 4 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { borderWidth: 1, borderColor: D.border },
  swatchSelected: { borderWidth: 3, borderColor: D.accent },
  card: { borderRadius: D.radiusThumb, backgroundColor: D.surface, borderWidth: 1, borderColor: D.border, overflow: 'hidden' },
  cardImage: {
    backgroundColor: '#F4F2EF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  cardName: { fontSize: 12, color: D.textPrimary, flex: 1 },
  badge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: '#11111199',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  favStar: { position: 'absolute', top: 6, right: 8, fontSize: 14, color: '#E05B5B' },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  scoreBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10, flex: 1 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: D.textPrimary },
  emptyMessage: { fontSize: 13, color: D.textSecondary, textAlign: 'center', lineHeight: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: D.textSecondary, marginBottom: 8, marginTop: 18 },
});
