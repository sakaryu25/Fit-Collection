import type { CategoryId, ColorId, SceneId, SeasonId, StyleId, WishStatus } from '@/constants/taxonomy';

// ---- 服の「見え方」: 着せ替えエンジンはこれだけを見る ----
export interface ItemLook {
  template_id: string;       // constants/templates.ts のID
  base_color: string;        // hex
  morphs: {
    length: number;          // -1(短い) 〜 +1(長い)
    oversize: number;        // 0(ジャスト) 〜 1(オーバー)
  };
}

export interface ClosetItem {
  id: string;
  category: CategoryId;
  name: string;
  brand?: string;
  color: ColorId;
  styles: StyleId[];
  seasons: SeasonId[];
  memo?: string;
  isFavorite: boolean;
  photoUri?: string;         // ローカルURI（将来: Storageパス）
  look: ItemLook;
  sourceWishlistId?: string;
  createdAt: number;
}

export interface WishlistItem {
  id: string;
  category: CategoryId;
  name: string;
  brand?: string;
  color: ColorId;
  price?: number;
  url?: string;
  memo?: string;
  status: WishStatus;
  photoUri?: string;
  look: ItemLook;
  tryOnCount: number;
  createdAt: number;
}

export type Slot = CategoryId;

export interface WornItem {
  source: 'closet' | 'wishlist';
  itemId: string;
  look: ItemLook;
}

export interface OutfitItemRef {
  slot: Slot;
  source: 'closet' | 'wishlist';
  itemId: string;
}

export interface Outfit {
  id: string;
  name: string;
  scene?: SceneId;
  seasons: SeasonId[];
  memo?: string;
  items: OutfitItemRef[];
  createdAt: number;
}

// ---- アバター ----
export interface AvatarConfig {
  skinColor: string;       // hex
  faceShape: 'round' | 'oval' | 'sharp';
  eyes: 'round' | 'oval' | 'line';
  brows: 'natural' | 'straight' | 'thin';
  mouth: 'smile' | 'small' | 'open';
  hairStyle: 'short' | 'bob' | 'medium' | 'long' | 'bun' | 'curly';
  hairColor: string;       // hex
  bodyType: 'slim' | 'normal' | 'wide';
  height: 'short' | 'mid' | 'tall';
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#F2C9A8',
  faceShape: 'round',
  eyes: 'round',
  brows: 'natural',
  mouth: 'smile',
  hairStyle: 'bob',
  hairColor: '#3B2B20',
  bodyType: 'normal',
  height: 'mid',
};

// ---- 相性確認 ----
export interface CompatibilityResult {
  score: number;                 // 0-100
  verdict: string;               // 「かなりアリ」等
  topMatches: ClosetItem[];      // 合わせやすい手持ち服
  suggestedOutfit: Partial<Record<Slot, ClosetItem>>;
  versatility: number;           // 1-5 着回ししやすさ
  reason: string;                // テンプレ文
}
