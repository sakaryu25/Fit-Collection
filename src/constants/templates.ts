import type { CategoryId } from './taxonomy';

// 服テンプレートカタログ。
// MVPはプリミティブ3D（shape: Garments.tsxが解釈）。将来GLBパスに差し替える。
export interface GarmentTemplate {
  id: string;
  category: CategoryId;
  label: string;
  shape: string; // 描画バリエーションキー
}

export const TEMPLATES: GarmentTemplate[] = [
  // トップス
  { id: 'tpl_tops_tshirt', category: 'tops', label: '半袖Tシャツ', shape: 'tee' },
  { id: 'tpl_tops_longsleeve', category: 'tops', label: '長袖トップス', shape: 'longsleeve' },
  { id: 'tpl_tops_hoodie', category: 'tops', label: 'パーカー', shape: 'hoodie' },
  { id: 'tpl_tops_knit', category: 'tops', label: 'ニット', shape: 'longsleeve' },
  { id: 'tpl_tops_shirt', category: 'tops', label: 'シャツ', shape: 'shirt' },
  // ボトムス
  { id: 'tpl_btm_straight', category: 'bottoms', label: 'ストレートパンツ', shape: 'pants' },
  { id: 'tpl_btm_wide', category: 'bottoms', label: 'ワイドパンツ', shape: 'pants_wide' },
  { id: 'tpl_btm_short', category: 'bottoms', label: 'ショートパンツ', shape: 'shorts' },
  { id: 'tpl_btm_skirt_mini', category: 'bottoms', label: 'ミニスカート', shape: 'skirt_mini' },
  { id: 'tpl_btm_skirt_long', category: 'bottoms', label: 'ロングスカート', shape: 'skirt_long' },
  // アウター
  { id: 'tpl_out_jacket', category: 'outer', label: 'ジャケット', shape: 'jacket' },
  { id: 'tpl_out_coat', category: 'outer', label: 'ロングコート', shape: 'coat' },
  { id: 'tpl_out_down', category: 'outer', label: 'ダウン', shape: 'down' },
  { id: 'tpl_out_cardigan', category: 'outer', label: 'カーディガン', shape: 'jacket' },
  // ワンピース
  { id: 'tpl_one_mini', category: 'onepiece', label: 'ミニワンピ', shape: 'onepiece_mini' },
  { id: 'tpl_one_long', category: 'onepiece', label: 'ロングワンピ', shape: 'onepiece_long' },
  // シューズ
  { id: 'tpl_sho_sneaker', category: 'shoes', label: 'スニーカー', shape: 'sneaker' },
  { id: 'tpl_sho_volume', category: 'shoes', label: 'ボリュームスニーカー', shape: 'sneaker_volume' },
  { id: 'tpl_sho_loafer', category: 'shoes', label: 'ローファー', shape: 'loafer' },
  { id: 'tpl_sho_boots', category: 'shoes', label: 'ブーツ', shape: 'boots' },
  // バッグ
  { id: 'tpl_bag_tote', category: 'bag', label: 'トート', shape: 'tote' },
  { id: 'tpl_bag_shoulder', category: 'bag', label: 'ショルダー', shape: 'shoulder' },
  { id: 'tpl_bag_mini', category: 'bag', label: 'ミニバッグ', shape: 'minibag' },
  // アクセ・帽子
  { id: 'tpl_acc_necklace', category: 'accessory', label: 'ネックレス', shape: 'necklace' },
  { id: 'tpl_hat_cap', category: 'hat', label: 'キャップ', shape: 'cap' },
  { id: 'tpl_hat_beanie', category: 'hat', label: 'ニット帽', shape: 'beanie' },
];

export const templatesFor = (category: CategoryId) =>
  TEMPLATES.filter((t) => t.category === category);

export const templateById = (id: string) =>
  TEMPLATES.find((t) => t.id === id);

export const defaultTemplateFor = (category: CategoryId) =>
  templatesFor(category)[0];
