export const SKIN_COLORS = ['#FBE3CC', '#F2C9A8', '#E0AC85', '#C68B62', '#9D6845', '#6F4A30'];

export const HAIR_COLORS = [
  '#1C1C1C', '#3B2B20', '#5C4330', '#8B6242', '#B58A5C',
  '#D9B88A', '#8E8E8E', '#C46A6A', '#7B6BB0', '#5B7BA8',
];

export const HAIR_STYLES = [
  { id: 'short', label: 'ショート' },
  { id: 'bob', label: 'ボブ' },
  { id: 'medium', label: 'ミディアム' },
  { id: 'long', label: 'ロング' },
  { id: 'bun', label: 'おだんご' },
  { id: 'curly', label: 'パーマ' },
] as const;

export const FACE_SHAPES = [
  { id: 'round', label: 'まる' },
  { id: 'oval', label: 'たまご' },
  { id: 'sharp', label: 'シャープ' },
] as const;

export const EYE_STYLES = [
  { id: 'round', label: 'まんまる' },
  { id: 'oval', label: 'たれめ' },
  { id: 'line', label: 'すずしげ' },
] as const;

export const BROW_STYLES = [
  { id: 'natural', label: 'ナチュラル' },
  { id: 'straight', label: 'ストレート' },
  { id: 'thin', label: 'ほそめ' },
] as const;

export const MOUTH_STYLES = [
  { id: 'smile', label: 'にっこり' },
  { id: 'small', label: 'ちいさめ' },
  { id: 'open', label: 'あんぐり' },
] as const;

export const BODY_TYPES = [
  { id: 'slim', label: 'スリム' },
  { id: 'normal', label: 'ふつう' },
  { id: 'wide', label: 'がっしり' },
] as const;

export const HEIGHTS = [
  { id: 'short', label: 'ひくめ' },
  { id: 'mid', label: 'ふつう' },
  { id: 'tall', label: 'たかめ' },
] as const;
