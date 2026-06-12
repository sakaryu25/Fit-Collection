import { useCloset } from '@/stores/closet';
import { useWishlist } from '@/stores/wishlist';
import { colorHex } from '@/constants/taxonomy';
import type { ClosetItem, WishlistItem } from '@/types';

type SeedCloset = Omit<ClosetItem, 'id' | 'createdAt'>;
type SeedWish = Omit<WishlistItem, 'id' | 'createdAt' | 'tryOnCount'>;

const look = (template_id: string, color: string, oversize = 0.3, length = 0) => ({
  template_id, base_color: colorHex(color), morphs: { length, oversize },
});

const CLOSET_SEED: SeedCloset[] = [
  { category: 'tops', name: '白Tシャツ', color: 'white', styles: ['simple', 'casual'], seasons: ['spring', 'summer'], isFavorite: true, look: look('tpl_tops_tshirt', 'white', 0.5) },
  { category: 'tops', name: '黒パーカー', color: 'black', styles: ['street', 'casual'], seasons: ['autumn', 'winter'], isFavorite: false, look: look('tpl_tops_hoodie', 'black', 0.8) },
  { category: 'tops', name: 'ベージュニット', color: 'beige', styles: ['kirei', 'korean'], seasons: ['autumn', 'winter'], isFavorite: false, look: look('tpl_tops_knit', 'beige', 0.4) },
  { category: 'bottoms', name: '黒スラックス', color: 'black', styles: ['mode', 'kirei'], seasons: ['spring', 'autumn', 'winter'], isFavorite: true, look: look('tpl_btm_straight', 'black', 0.2, 0.8) },
  { category: 'bottoms', name: 'デニムワイド', color: 'navy', styles: ['casual', 'street'], seasons: ['spring', 'autumn'], isFavorite: false, look: look('tpl_btm_wide', 'navy', 0.5, 0.9) },
  { category: 'bottoms', name: 'ロングスカート', color: 'beige', styles: ['kirei', 'korean'], seasons: ['spring', 'summer'], isFavorite: false, look: look('tpl_btm_skirt_long', 'beige', 0.3, 0.5) },
  { category: 'outer', name: 'デニムジャケット', color: 'navy', styles: ['casual', 'furugi'], seasons: ['spring', 'autumn'], isFavorite: false, look: look('tpl_out_jacket', 'navy', 0.5) },
  { category: 'shoes', name: '黒ローファー', color: 'black', styles: ['kirei', 'mode'], seasons: ['spring', 'autumn', 'winter'], isFavorite: false, look: look('tpl_sho_loafer', 'black') },
  { category: 'shoes', name: '白スニーカー', color: 'white', styles: ['casual', 'simple'], seasons: ['spring', 'summer', 'autumn'], isFavorite: true, look: look('tpl_sho_sneaker', 'white') },
  { category: 'bag', name: '黒ショルダー', color: 'black', styles: ['simple'], seasons: [], isFavorite: false, look: look('tpl_bag_shoulder', 'black') },
];

const WISH_SEED: SeedWish[] = [
  { category: 'outer', name: 'レザージャケット', brand: 'ZARA', color: 'black', price: 12990, status: 'want', look: look('tpl_out_jacket', 'black', 0.4) },
  { category: 'tops', name: 'ピンクのニット', brand: 'GU', color: 'pink', price: 2990, status: 'want', look: look('tpl_tops_knit', 'pink', 0.6) },
  { category: 'shoes', name: 'ボリュームスニーカー', brand: 'NIKE', color: 'white', price: 16500, status: 'hold', look: look('tpl_sho_volume', 'white') },
];

export function seedDemoData() {
  const closet = useCloset.getState();
  const wishlist = useWishlist.getState();
  if (closet.items.length > 0 || wishlist.items.length > 0) return;
  // addは先頭追加なので逆順に入れて定義順を保つ
  [...CLOSET_SEED].reverse().forEach((i) => closet.add(i));
  [...WISH_SEED].reverse().forEach((i) => wishlist.add(i));
}
