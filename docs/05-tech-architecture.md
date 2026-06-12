# 05. 技術構成・アーキテクチャ

## 1. 技術スタック

| レイヤ | 採用技術 | 理由 |
|---|---|---|
| アプリ | **Expo (SDK 最新) + React Native + TypeScript** | 要件指定。EAS Buildでネイティブモジュールも使える（Expo Goは3D周りで不可、**dev clientビルド前提**） |
| ルーティング | expo-router | ファイルベースで画面遷移図とディレクトリが一致する |
| 3D | **@react-three/fiber/native + @react-three/drei/native + expo-gl + three.js** | RN/Expoで3Dを扱う事実上の標準。GLB読込・スキニング・morphすべて対応 |
| 3Dアセット | GLB (Draco圧縮) + KTX2テクスチャ | サイズと読込速度 |
| 動的テクスチャ | @shopify/react-native-skia でオフスクリーン描画 → three の Texture へ | 柄・写真転写の合成 |
| 状態管理 | Zustand（着せ替え・アバター等のローカル状態）+ TanStack Query（サーバ状態） | シンプルで3Dと相性が良い |
| バックエンド | Supabase (Auth / Postgres / Storage / Edge Functions) | 要件指定 |
| 画像処理 | expo-image-picker / expo-image-manipulator / expo-image | 撮影・リサイズ・キャッシュ表示 |
| アニメーション(UI) | react-native-reanimated | ぷにっとしたマイクロアニメ |
| スナップショット | expo-gl の takeSnapshotAsync（GLViewのキャプチャ） | コーデサムネ生成 |

## 2. RN/Expoで3Dを扱う現実的な判断

### 採用: react-three-fiber native

- `@react-three/fiber/native` + `expo-gl` は実績が多く、GLBのSkinnedMesh・morphTargets・AnimationMixerが動く
- 注意点と対策:
  - **Expo Goでは動かない** → `npx expo prebuild` + dev client / EAS Build 前提で開発
  - GLB読み込みは `useGLTF`（dreiのnative版）+ assetをバンドル or ファイルキャッシュ
  - テクスチャのKTX2はローダー設定が必要。難しければMVPはPNG/JPG 512pxで十分
  - 60fpsを狙わない。**30fps + 必要時のみ再レンダリング**（`frameloop="demand"`、idleモーション中だけ invalidate）
- 代替案との比較:
  - Unity as a Library: 表現力最強だがExpoワークフロー崩壊・ビルド複雑化 → 不採用
  - WebView + three.js: ブリッジが遅く操作感が悪い → 不採用
  - 2.5D（画像合成）: 3D要件を満たさない → 不採用（ただし最悪のフォールバックとして意識）

### 軽量化の指針

- シーン合計 < 100k ポリゴン（部屋30k + アバター20k + 服50k）
- ライトはAmbient + Directional 1灯。影はテクスチャベイク・丸影
- マテリアルは MeshToonMaterial / MeshLambertMaterial。PBR不使用
- 部屋とアバターでGLViewを分けない（1シーン内でカメラ移動。コンテキスト生成コストが高い）

## 3. ディレクトリ構成

```
fit-collection/
├── app/                          # expo-router
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # 4タブ
│   │   ├── index.tsx             # S-10 マイルーム
│   │   ├── closet/
│   │   │   ├── index.tsx         # S-20 一覧
│   │   │   └── [id].tsx          # S-21 詳細
│   │   ├── outfits/
│   │   │   ├── index.tsx         # S-40
│   │   │   └── [id].tsx          # S-41
│   │   └── wishlist/
│   │       ├── index.tsx         # S-50
│   │       ├── [id].tsx          # S-51
│   │       └── [id]/compatibility.tsx  # S-53
│   ├── avatar-creator.tsx        # S-03（モーダル）
│   ├── try-on.tsx                # S-30 着せ替え（フルスクリーンモーダル）
│   ├── closet-item-form.tsx      # S-22/23（モーダル, ?id=で編集）
│   ├── wishlist-item-form.tsx    # S-52
│   └── settings.tsx              # S-60
├── src/
│   ├── components/
│   │   ├── ui/                   # ItemCard, CategoryChips, ColorPalette, ScoreRing, BottomSheet...
│   │   └── three/
│   │       ├── AvatarViewer.tsx  # モード: room | tryon | creator | mini
│   │       ├── RoomScene.tsx
│   │       ├── AvatarModel.tsx   # パーツ組み立て・morph適用
│   │       ├── GarmentMesh.tsx   # テンプレ読込 + ItemLook適用 + skeleton bind
│   │       └── loaders.ts        # GLB/テクスチャローダ・キャッシュ
│   ├── features/
│   │   ├── avatar/               # アバター状態・パーツ定義
│   │   ├── closet/               # CRUD hooks (useClosetItems...)
│   │   ├── wishlist/
│   │   ├── outfits/
│   │   ├── tryon/                # 着せ替えstore（slots）, スナップショット
│   │   └── compatibility/        # スコア計算 getCompatibility()
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── storage.ts            # アップロード・署名URL
│   │   └── texture-factory.ts    # Skiaで柄テクスチャ合成
│   ├── constants/
│   │   ├── taxonomy.ts           # カテゴリ/色/系統/季節/シーン定数
│   │   ├── templates.ts          # 服テンプレカタログ（id→glb, morph定義）
│   │   └── avatar-parts.ts       # 髪型/顔パーツカタログ
│   └── types/                    # ItemLook, ClosetItem, Outfit...
├── assets/
│   └── models/                   # base_body.glb, hair_*.glb, tpl_*.glb, room.glb
├── supabase/
│   ├── migrations/               # 04のSQL
│   └── functions/                # 将来: compatibility-ai, image-process
└── docs/
```

## 4. コアの状態設計

```ts
// 着せ替えstore (Zustand)
type Slot = 'tops'|'bottoms'|'outer'|'onepiece'|'shoes'|'bag'|'accessory'|'hat';
type WornItem = { source: 'closet'|'wishlist'; itemId: string; look: ItemLook };

interface TryOnState {
  slots: Partial<Record<Slot, WornItem>>;
  wear(slot: Slot, item: WornItem): void;   // onepiece排他処理込み
  remove(slot: Slot): void;
  reset(): void;
  loadOutfit(outfit: OutfitWithItems): void;
}
```

- `GarmentMesh` は `WornItem.look` のみを入力にする → 手持ち/検討中/将来のAI生成すべて同じ描画パス
- 相性計算インターフェースを固定:

```ts
// MVP: ルールベース(ローカル) → 将来: Edge Function + AI に差し替え
function getCompatibility(wish: ItemLike, closet: ItemLike[]): CompatibilityResult;
```

## 5. 服画像からどこまで再現できるか（現実ライン）

| 要素 | MVPでの再現方法 | 再現度 |
|---|---|---|
| 色 | 写真からドミナントカラー抽出→確認 | ◎ |
| 柄 | プリセット柄+2色指定（ボーダー等）/ 写真タイル | ○ |
| シルエット・丈感・袖・首元 | テンプレ選択 + morphスライダー | ○ |
| オーバーサイズ感 | morph | ○ |
| ロゴ・プリント | 写真から矩形切り抜き→胸/背面に転写 | ○ |
| 素材感 | マテリアルプリセット5種 | △ |
| レイヤード感 | アウター/トップス重ね着（簡易貫通対策） | △ |
| 完全な見た目再現 | 対象外（将来AI） | — |

将来のAI化ロードマップ: ①背景透過(セグメンテーション) → ②カテゴリ/色自動判定 → ③柄のテクスチャ自動生成 → ④シルエット推定によるテンプレ/morph自動選択。④まで行くと「写真を撮るだけで仮試着」になる。

## 6. 開発・運用

- EAS Build (development / preview / production チャンネル)
- 環境変数: `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supabaseマイグレーションは `supabase/migrations` でコード管理
- 3Dアセットは命名規約 + `templates.ts` カタログで管理（アセット追加=カタログ1行追加）
