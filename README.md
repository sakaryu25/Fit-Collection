# Fit Collection

> 買う前に、自分のクローゼットと合うか確認できる、部屋付きアバター着せ替えアプリ

自分専用のデフォルメ3Dアバターを作り、手持ちの服を登録してクローゼット管理し、
マイルームの中で着せ替え・コーデ確認ができるスマホアプリ。
買おうか迷っている服も仮試着して、手持ち服との相性を確認できる。

## コアコンセプト

- **人はリアルすぎない** — トモコレ風の親しみやすいデフォルメ3Dアバター
- **服はなるべく忠実** — 色・柄・シルエット・丈感を重視し「その服っぽさ」を再現
- **部屋がある** — クローゼットが単なる一覧ではなく、世界観の一部になる
- **実用と遊びの両立** — 着せ替えの楽しさ × 購入判断の役に立つ実用性

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [01-requirements.md](docs/01-requirements.md) | 要件定義（機能要件・非機能要件・ユーザーストーリー） |
| [02-screens.md](docs/02-screens.md) | 画面一覧・画面遷移図・各画面のUI設計 |
| [03-avatar-room.md](docs/03-avatar-room.md) | アバター仕様・マイルーム仕様・着せ替え/仮試着仕様 |
| [04-data-design.md](docs/04-data-design.md) | Supabaseテーブル設計・Storage構成・RLS |
| [05-tech-architecture.md](docs/05-tech-architecture.md) | 技術構成・RN/Expoでの3D実装方法・ディレクトリ構成 |
| [06-mvp-plan.md](docs/06-mvp-plan.md) | MVP範囲・実装優先順位・実装ステップ・将来拡張 |

## 技術スタック（概要）

- **アプリ**: React Native / Expo（expo-router）
- **3D**: react-three-fiber (`@react-three/fiber/native`) + expo-gl + GLBアセット
- **バックエンド**: Supabase（Auth / Postgres / Storage / Edge Functions）
- **状態管理**: Zustand + TanStack Query

詳細は [05-tech-architecture.md](docs/05-tech-architecture.md) を参照。
