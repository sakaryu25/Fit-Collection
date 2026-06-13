import Anthropic from '@anthropic-ai/sdk';

import { HAIR_COLORS, SKIN_COLORS } from '@/constants/avatar-parts';
import type { AvatarConfig } from '@/types';

// 顔写真 → デフォルメアバターのパーツ構成をClaude visionで抽出する。
// APIキーは EXPO_PUBLIC_ANTHROPIC_API_KEY（開発用。本番はSupabase Edge Function経由に差し替える）。

const SCHEMA = {
  type: 'object',
  properties: {
    skinColor: { type: 'string', enum: SKIN_COLORS },
    faceShape: { type: 'string', enum: ['round', 'oval', 'sharp'] },
    eyes: { type: 'string', enum: ['round', 'oval', 'line'] },
    brows: { type: 'string', enum: ['natural', 'straight', 'thin'] },
    mouth: { type: 'string', enum: ['smile', 'small', 'open'] },
    hairStyle: { type: 'string', enum: ['short', 'bob', 'medium', 'long', 'bun', 'curly'] },
    hairColor: { type: 'string', enum: HAIR_COLORS },
    bodyType: { type: 'string', enum: ['slim', 'normal', 'wide'] },
    height: { type: 'string', enum: ['short', 'mid', 'tall'] },
  },
  required: ['skinColor', 'faceShape', 'eyes', 'brows', 'mouth', 'hairStyle', 'hairColor', 'bodyType', 'height'],
  additionalProperties: false,
} as const;

const PROMPT = `この写真の人物を、トモダチコレクション風のデフォルメ3Dアバターとして再現するためのパーツを選んでください。

選び方のガイド:
- skinColor: 肌のトーンに最も近い色
- faceShape: 丸顔=round / 卵型=oval / シャープな輪郭=sharp
- eyes: ぱっちり丸い=round / たれ目・標準=oval / 細め・切れ長=line
- brows: 角度のある自然な眉=natural / 平行眉=straight / 細い眉=thin
- mouth: 口角が上がっている=smile / 小さめ=small / 開いている・大きめ=open
- hairStyle: 髪の長さとシルエットで選ぶ（あご上=short/bob、肩=medium、肩下=long、結んでいる=bun、強いカール=curly）。前髪のあるボブはbob
- hairColor: 髪色に最も近い色
- bodyType/height: 写真から判断できなければ normal / mid

完全一致より「その人っぽさ」が伝わる選択を優先してください。`;

export function aiAvailable(): boolean {
  return !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
}

export async function generateAvatarFromPhoto(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png',
): Promise<AvatarConfig> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('AI生成にはAPIキーの設定が必要です（EXPO_PUBLIC_ANTHROPIC_API_KEY）');
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') {
    throw new Error('アバターの解析に失敗しました');
  }
  return JSON.parse(text.text) as AvatarConfig;
}
