import { NEUTRAL_COLORS, STYLE_NEIGHBORS, categoryLabel, colorLabel, styleLabel } from '@/constants/taxonomy';
import type { ColorId, StyleId } from '@/constants/taxonomy';
import type { ClosetItem, CompatibilityResult, Slot, WishlistItem } from '@/types';

// ---- 色相性 ----
// ニュートラル同士/ニュートラル×有彩色は高評価。有彩色同士は限定ペアのみ好相性。
const GOOD_COLOR_PAIRS: [ColorId, ColorId][] = [
  ['blue', 'brown'], ['green', 'brown'], ['pink', 'blue'],
  ['red', 'blue'], ['yellow', 'green'], ['purple', 'pink'],
];

function colorPairScore(a: ColorId, b: ColorId): number {
  const aN = NEUTRAL_COLORS.includes(a);
  const bN = NEUTRAL_COLORS.includes(b);
  if (aN && bN) return 1.0;
  if (aN || bN) return 0.85;
  if (a === b) return 0.7; // 同色有彩色はワントーンでまとまるが冒険
  const ok = GOOD_COLOR_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return ok ? 0.75 : 0.3;
}

function stylePairScore(a: StyleId[], b: StyleId[]): number {
  if (a.length === 0 || b.length === 0) return 0.6; // 不明は中立
  let best = 0.2;
  for (const sa of a) {
    for (const sb of b) {
      if (sa === sb) best = Math.max(best, 1.0);
      else if (STYLE_NEIGHBORS[sa]?.includes(sb)) best = Math.max(best, 0.7);
    }
  }
  return best;
}

function seasonScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.7;
  const overlap = a.filter((s) => b.includes(s)).length;
  return overlap > 0 ? 1.0 : 0.3;
}

export function itemPairScore(wish: WishlistItem, item: ClosetItem): number {
  // wishには系統・季節が未入力のことが多いため色を重視する
  const c = colorPairScore(wish.color, item.color);
  return 0.6 * c + 0.25 * stylePairScore(item.styles, wishStyles(wish)) + 0.15 * seasonScore([], item.seasons);
}

// wishlistの系統はカテゴリ・色から推定（未入力前提の簡易ロジック）
function wishStyles(wish: WishlistItem): StyleId[] {
  if (NEUTRAL_COLORS.includes(wish.color)) return ['simple', 'kirei'];
  return ['casual'];
}

const PAIRABLE: Slot[] = ['tops', 'bottoms', 'outer', 'onepiece', 'shoes', 'bag', 'accessory', 'hat'];

export function getCompatibility(wish: WishlistItem, closet: ClosetItem[]): CompatibilityResult {
  const candidates = closet
    .filter((i) => PAIRABLE.includes(i.category) && i.category !== wish.category)
    .map((item) => ({ item, score: itemPairScore(wish, item) }))
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      score: 50,
      verdict: 'まだわからない',
      topMatches: [],
      suggestedOutfit: {},
      versatility: 1,
      reason: 'クローゼットに服を登録すると、相性を判定できるようになります。',
    };
  }

  const avgTop = candidates.slice(0, 5).reduce((s, c) => s + c.score, 0) / Math.min(5, candidates.length);
  const matchCount = candidates.filter((c) => c.score >= 0.6).length;
  const versatility = Math.max(1, Math.min(5, Math.ceil((matchCount / Math.max(candidates.length, 1)) * 5)));

  const score = Math.round(avgTop * 80 + (versatility / 5) * 20);

  // おすすめコーデ自動組成: wishのカテゴリを軸に各スロットの最高スコアを採用
  const suggested: Partial<Record<Slot, ClosetItem>> = {};
  const wantSlots: Slot[] = wish.category === 'onepiece'
    ? ['shoes', 'bag', 'outer']
    : (['tops', 'bottoms', 'shoes'] as Slot[]).filter((s) => s !== wish.category);
  for (const slot of wantSlots) {
    const best = candidates.find((c) => c.item.category === slot);
    if (best && best.score >= 0.5) suggested[slot] = best.item;
  }

  const topMatches = candidates.slice(0, 5).map((c) => c.item);
  const verdict =
    score >= 80 ? 'かなりアリ' :
    score >= 65 ? 'アリ' :
    score >= 50 ? '保留でもいいかも' : '見送りが無難かも';

  const styleCounts = new Map<string, number>();
  topMatches.forEach((i) => i.styles.forEach((s) => styleCounts.set(s, (styleCounts.get(s) ?? 0) + 1)));
  const domStyle = [...styleCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const names = topMatches.slice(0, 3).map((i) => i.name || `${colorLabel(i.color)}の${categoryLabel(i.category)}`);
  const reason =
    `この${categoryLabel(wish.category)}は、あなたの${names.join('、')}と相性が良いです。` +
    (domStyle ? `${styleLabel(domStyle)}寄りのコーデに使いやすく、` : '') +
    (versatility >= 4 ? '着回ししやすいアイテムです。' : versatility >= 2 ? 'そこそこ着回しできそうです。' : '合わせ方は少し選びそうです。');

  return { score, verdict, topMatches, suggestedOutfit: suggested, versatility, reason };
}
