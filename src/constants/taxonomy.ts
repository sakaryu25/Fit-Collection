export type CategoryId =
  | 'tops' | 'bottoms' | 'outer' | 'onepiece'
  | 'shoes' | 'bag' | 'accessory' | 'hat';

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: 'tops', label: 'トップス', emoji: '👕' },
  { id: 'bottoms', label: 'ボトムス', emoji: '👖' },
  { id: 'outer', label: 'アウター', emoji: '🧥' },
  { id: 'onepiece', label: 'ワンピース', emoji: '👗' },
  { id: 'shoes', label: 'シューズ', emoji: '👟' },
  { id: 'bag', label: 'バッグ', emoji: '👜' },
  { id: 'accessory', label: 'アクセ', emoji: '💍' },
  { id: 'hat', label: '帽子', emoji: '🧢' },
];

export const categoryLabel = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export type ColorId =
  | 'black' | 'white' | 'gray' | 'beige' | 'brown' | 'navy'
  | 'blue' | 'green' | 'red' | 'pink' | 'purple' | 'yellow';

export const COLORS: { id: ColorId; label: string; hex: string }[] = [
  { id: 'black', label: 'ブラック', hex: '#1A1A1A' },
  { id: 'white', label: 'ホワイト', hex: '#F5F5F2' },
  { id: 'gray', label: 'グレー', hex: '#9A9A9A' },
  { id: 'beige', label: 'ベージュ', hex: '#C9B8A8' },
  { id: 'brown', label: 'ブラウン', hex: '#7A5C43' },
  { id: 'navy', label: 'ネイビー', hex: '#2C3A58' },
  { id: 'blue', label: 'ブルー', hex: '#4A7BC8' },
  { id: 'green', label: 'グリーン', hex: '#4E7D5B' },
  { id: 'red', label: 'レッド', hex: '#C84A4A' },
  { id: 'pink', label: 'ピンク', hex: '#E8A0B4' },
  { id: 'purple', label: 'パープル', hex: '#8B6BB0' },
  { id: 'yellow', label: 'イエロー', hex: '#E5C45A' },
];

export const colorHex = (id: string) =>
  COLORS.find((c) => c.id === id)?.hex ?? '#9A9A9A';
export const colorLabel = (id: string) =>
  COLORS.find((c) => c.id === id)?.label ?? id;

// ニュートラル＝何にでも合わせやすい色
export const NEUTRAL_COLORS: ColorId[] = ['black', 'white', 'gray', 'beige', 'navy'];

export type StyleId =
  | 'casual' | 'street' | 'mode' | 'kirei'
  | 'furugi' | 'korean' | 'y2k' | 'simple';

export const STYLES: { id: StyleId; label: string }[] = [
  { id: 'casual', label: 'カジュアル' },
  { id: 'street', label: 'ストリート' },
  { id: 'mode', label: 'モード' },
  { id: 'kirei', label: 'きれいめ' },
  { id: 'furugi', label: '古着' },
  { id: 'korean', label: '韓国系' },
  { id: 'y2k', label: 'Y2K' },
  { id: 'simple', label: 'シンプル' },
];

export const styleLabel = (id: string) =>
  STYLES.find((s) => s.id === id)?.label ?? id;

// 系統の隣接マップ（相性スコア用）: 近い系統ほど合わせやすい
export const STYLE_NEIGHBORS: Record<StyleId, StyleId[]> = {
  casual: ['street', 'furugi', 'simple', 'korean'],
  street: ['casual', 'y2k', 'furugi'],
  mode: ['kirei', 'simple'],
  kirei: ['mode', 'korean', 'simple'],
  furugi: ['casual', 'street', 'y2k'],
  korean: ['kirei', 'casual', 'simple'],
  y2k: ['street', 'furugi'],
  simple: ['casual', 'mode', 'kirei', 'korean'],
};

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: { id: SeasonId; label: string }[] = [
  { id: 'spring', label: '春' },
  { id: 'summer', label: '夏' },
  { id: 'autumn', label: '秋' },
  { id: 'winter', label: '冬' },
];

export type SceneId =
  | 'school' | 'date' | 'cafe' | 'hangout'
  | 'trip' | 'parttime' | 'event' | 'party';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'school', label: '学校' },
  { id: 'date', label: 'デート' },
  { id: 'cafe', label: 'カフェ' },
  { id: 'hangout', label: '遊び' },
  { id: 'trip', label: '旅行' },
  { id: 'parttime', label: 'バイト' },
  { id: 'event', label: 'イベント' },
  { id: 'party', label: '飲み会' },
];

export type WishStatus = 'want' | 'hold' | 'bought' | 'pass';

export const WISH_STATUSES: { id: WishStatus; label: string }[] = [
  { id: 'want', label: '欲しい' },
  { id: 'hold', label: '保留' },
  { id: 'bought', label: '買った' },
  { id: 'pass', label: 'いらない' },
];
