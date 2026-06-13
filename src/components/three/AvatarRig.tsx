import React, { useMemo } from 'react';

import type { AvatarConfig, Slot, WornItem } from '@/types';
import { Garment } from './Garments';

// デフォルメ3.5頭身アバターをプリミティブで構成（Mii風）。
// 単位: 身長 ≈ 2.0。将来GLB化してもpropsの契約(config/worn)は維持する。

const HEIGHT_SCALE = { short: 0.93, mid: 1.0, tall: 1.07 } as const;
const BODY_W = { slim: 0.88, normal: 1.0, wide: 1.14 } as const;
const FACE_W = { round: 1.0, oval: 0.92, sharp: 0.86 } as const;

export interface AvatarRigProps {
  config: AvatarConfig;
  worn?: Partial<Record<Slot, WornItem>>;
}

// Mii風の髪: 頭頂キャップ + 前髪(バング) + サイドロック の組み合わせで構成
function Hair({ style, color }: { style: AvatarConfig['hairStyle']; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.85} />;

  // 頭頂を覆うキャップ（目にかからない高さで止める）
  const cap = (
    <mesh position={[0, 0.08, -0.02]} scale={[1.07, 1.0, 1.04]}>
      <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
      {mat}
    </mesh>
  );
  // 前髪: 額に沿った薄い帯（眉の少し上、目にはかからない高さで止まる）
  const bangs = (
    <mesh position={[0, 0, 0.02]}>
      <sphereGeometry args={[0.435, 24, 10, 0, Math.PI * 2, Math.PI * 0.26, Math.PI * 0.15]} />
      {mat}
    </mesh>
  );
  // サイドロック: 耳の前に垂れる髪
  const sideLocks = (len: number, curl = 0) => (
    <group>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.37, -0.08 - len / 2 + 0.12, 0.04]}
          rotation={[0, 0, side * -curl]}
        >
          <capsuleGeometry args={[0.09, len, 6, 10]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
  // 後ろ髪
  const back = (len: number, width = 1.0) => (
    <mesh position={[0, -0.02 - len * 0.3, -0.21]} scale={[width, 1, 0.5]}>
      <capsuleGeometry args={[0.3, len, 8, 14]} />
      {mat}
    </mesh>
  );

  switch (style) {
    case 'short':
      return (
        <group>
          {cap}
          {bangs}
          <mesh position={[0, 0.0, -0.22]} scale={[1.0, 0.78, 0.42]}>
            <sphereGeometry args={[0.42, 20, 14]} />
            {mat}
          </mesh>
        </group>
      );
    case 'bob':
      // Mii風: 前髪ぱっつん + 内巻きサイド + 肩上ボブ
      return (
        <group>
          {cap}
          {bangs}
          {sideLocks(0.3, 0.18)}
          {back(0.28, 1.0)}
        </group>
      );
    case 'medium':
      return (
        <group>
          {cap}
          {bangs}
          {sideLocks(0.48, 0.1)}
          {back(0.5, 0.92)}
        </group>
      );
    case 'long':
      return (
        <group>
          {cap}
          {bangs}
          {sideLocks(0.6, 0.06)}
          {back(0.9, 0.85)}
        </group>
      );
    case 'bun':
      return (
        <group>
          {cap}
          {bangs}
          <mesh position={[0, 0.46, -0.1]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            {mat}
          </mesh>
        </group>
      );
    case 'curly':
      return (
        <group>
          {cap}
          {[[-0.26, 0.22], [0, 0.34], [0.26, 0.22], [-0.36, -0.02], [0.36, -0.02]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, -0.02]}>
              <sphereGeometry args={[0.2, 14, 10]} />
              {mat}
            </mesh>
          ))}
          {sideLocks(0.3, 0.25)}
          {back(0.28, 1.02)}
        </group>
      );
  }
}

function Face({ config }: { config: AvatarConfig }) {
  const eyeY = 0.02;
  const eyeX = 0.16;
  const eyeZ = 0.36;
  const brows = config.brows ?? 'natural'; // 旧保存データはbrows未設定
  return (
    <group>
      {/* 目 */}
      {[-eyeX, eyeX].map((x, i) => (
        <group key={i} position={[x, eyeY, eyeZ]}>
          <mesh
            scale={
              config.eyes === 'round' ? [1, 1.3, 0.5]
              : config.eyes === 'oval' ? [1, 0.9, 0.5]
              : [1.25, 0.32, 0.5]
            }
          >
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial color="#26201C" roughness={0.35} />
          </mesh>
          {/* 瞳ハイライト */}
          {config.eyes !== 'line' && (
            <mesh position={[0.015, 0.025, 0.028]} scale={[1, 1, 0.6]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )}
        </group>
      ))}
      {/* 眉 */}
      {[-eyeX, eyeX].map((x, i) => (
        <mesh
          key={i}
          position={[x, eyeY + 0.09, eyeZ - 0.01]}
          rotation={[0, 0, (i === 0 ? 1 : -1) * (brows === 'natural' ? 0.18 : 0)]}
          scale={
            brows === 'thin' ? [1, 0.5, 1] : [1, 1, 1]
          }
        >
          <capsuleGeometry args={[0.016, 0.08, 4, 8]} />
          <meshStandardMaterial color="#3A2E24" roughness={0.8} />
        </mesh>
      ))}
      {/* ほっぺ */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, -0.08, 0.32]} scale={[1, 0.7, 0.4]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#F0A8A0" roughness={1} transparent opacity={0.65} />
        </mesh>
      ))}
      {/* 口 */}
      <mesh
        position={[0, -0.15, 0.37]}
        scale={
          config.mouth === 'smile' ? [1.4, 0.5, 0.4]
          : config.mouth === 'small' ? [0.7, 0.5, 0.4]
          : [1, 1, 0.5]
        }
      >
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#B05A50" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function AvatarRig({ config, worn = {} }: AvatarRigProps) {
  const h = HEIGHT_SCALE[config.height];
  const w = BODY_W[config.bodyType];
  const skin = config.skinColor;
  const skinMat = useMemo(() => <meshStandardMaterial color={skin} roughness={0.9} />, [skin]);

  const hasOnepiece = !!worn.onepiece;

  return (
    <group scale={[1, h, 1]}>
      {/* ===== 頭 (y: 1.5 中心, 半径0.42) ===== */}
      <group position={[0, 1.5, 0]}>
        <mesh scale={[FACE_W[config.faceShape], 1, 0.95]}>
          <sphereGeometry args={[0.42, 28, 20]} />
          {skinMat}
        </mesh>
        <Face config={config} />
        <Hair style={config.hairStyle} color={config.hairColor} />
        {worn.hat && <Garment look={worn.hat.look} bodyWidth={w} />}
      </group>

      {/* ===== 胴 (y: 0.6-1.1) ===== */}
      <group position={[0, 0.82, 0]}>
        <mesh scale={[w, 1, 0.8 * w]}>
          <capsuleGeometry args={[0.26, 0.36, 8, 16]} />
          <meshStandardMaterial color="#E8E6E1" roughness={0.95} />
        </mesh>
      </group>

      {/* 腕 */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (0.3 * w + 0.06), 0.82, 0]} rotation={[0, 0, side * -0.18]}>
          <mesh>
            <capsuleGeometry args={[0.075, 0.42, 6, 12]} />
            {skinMat}
          </mesh>
        </group>
      ))}

      {/* 脚 (y: 0-0.55) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.13 * w, 0.3, 0]}>
          <mesh>
            <capsuleGeometry args={[0.095, 0.42, 6, 12]} />
            {skinMat}
          </mesh>
        </group>
      ))}

      {/* ===== 服 ===== */}
      {hasOnepiece && <Garment look={worn.onepiece!.look} bodyWidth={w} />}
      {!hasOnepiece && worn.tops && <Garment look={worn.tops.look} bodyWidth={w} />}
      {!hasOnepiece && worn.bottoms && <Garment look={worn.bottoms.look} bodyWidth={w} />}
      {worn.outer && <Garment look={worn.outer.look} bodyWidth={w} />}
      {worn.shoes && <Garment look={worn.shoes.look} bodyWidth={w} />}
      {worn.bag && <Garment look={worn.bag.look} bodyWidth={w} />}
      {worn.accessory && <Garment look={worn.accessory.look} bodyWidth={w} />}
    </group>
  );
}
