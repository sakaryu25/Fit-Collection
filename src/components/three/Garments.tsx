import React from 'react';

import { templateById } from '@/constants/templates';
import type { ItemLook } from '@/types';

// テンプレID + ItemLook からプリミティブ服を描画する。
// アバター座標系: 頭中心y=1.5 / 胴中心y=0.82 / 脚y=0.3 / 接地y=0
// 将来はここをGLB(SkinnedMesh)読込に差し替える。Lookの契約は不変。

interface GarmentProps {
  look: ItemLook;
  bodyWidth: number; // 体型による幅係数
}

export function Garment({ look, bodyWidth: w }: GarmentProps) {
  const tpl = templateById(look.template_id);
  if (!tpl) return null;
  const color = look.base_color;
  const over = 1 + look.morphs.oversize * 0.22; // ゆとり
  const len = look.morphs.length;               // -1..+1
  const mat = <meshStandardMaterial color={color} roughness={0.9} />;

  switch (tpl.shape) {
    // ---- トップス ----
    case 'tee':
    case 'longsleeve':
    case 'shirt':
    case 'hoodie': {
      const sleeve = tpl.shape === 'tee' ? 0.16 : 0.42;
      const bottomY = 0.62 - len * 0.12;
      const topY = 1.12;
      const midY = (topY + bottomY) / 2;
      const height = topY - bottomY;
      return (
        <group>
          <mesh position={[0, midY, 0]} scale={[w * over, 1, 0.82 * w * over]}>
            <cylinderGeometry args={[0.3, 0.32 + look.morphs.oversize * 0.05, height, 18]} />
            {mat}
          </mesh>
          {/* 袖 */}
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * (0.3 * w * over + 0.06), 1.02 - sleeve / 2 + 0.1, 0]}
              rotation={[0, 0, side * -0.18]}
            >
              <cylinderGeometry args={[0.095 * over, 0.105 * over, sleeve, 12]} />
              {mat}
            </mesh>
          ))}
          {tpl.shape === 'hoodie' && (
            <mesh position={[0, 1.18, -0.2]} scale={[1, 0.7, 0.7]}>
              <sphereGeometry args={[0.22, 14, 10]} />
              {mat}
            </mesh>
          )}
        </group>
      );
    }

    // ---- ボトムス ----
    case 'pants':
    case 'pants_wide': {
      const wide = tpl.shape === 'pants_wide' ? 1.5 : 1.0;
      const bottom = 0.06 - len * 0.0 + (1 - (len + 1) / 2) * 0.25; // len=1で足首まで
      const top = 0.62;
      const legH = top - bottom;
      return (
        <group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.13 * w, bottom + legH / 2, 0]}>
              <cylinderGeometry args={[0.105 * over * wide, 0.12 * over * wide, legH, 12]} />
              {mat}
            </mesh>
          ))}
          <mesh position={[0, top - 0.04, 0]} scale={[w * over, 1, 0.8 * w * over]}>
            <cylinderGeometry args={[0.3, 0.3, 0.14, 16]} />
            {mat}
          </mesh>
        </group>
      );
    }
    case 'shorts':
      return (
        <group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.13 * w, 0.5, 0]}>
              <cylinderGeometry args={[0.12 * over, 0.13 * over, 0.22, 12]} />
              {mat}
            </mesh>
          ))}
          <mesh position={[0, 0.6, 0]} scale={[w * over, 1, 0.8 * w * over]}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 16]} />
            {mat}
          </mesh>
        </group>
      );
    case 'skirt_mini':
    case 'skirt_long': {
      const long = tpl.shape === 'skirt_long';
      const h = (long ? 0.5 : 0.24) + len * 0.08;
      return (
        <mesh position={[0, 0.62 - h / 2, 0]} scale={[w * over, 1, 0.85 * w * over]}>
          <cylinderGeometry args={[0.3, (long ? 0.42 : 0.38) * over, h, 18]} />
          {mat}
        </mesh>
      );
    }

    // ---- アウター ----
    case 'jacket':
    case 'coat':
    case 'down': {
      const long = tpl.shape === 'coat';
      const puff = tpl.shape === 'down' ? 1.18 : 1.0;
      const bottomY = (long ? 0.3 : 0.58) - len * 0.1;
      const topY = 1.14;
      const height = topY - bottomY;
      const o = over * 1.16 * puff;
      return (
        <group>
          <mesh position={[0, (topY + bottomY) / 2, -0.02]} scale={[w * o, 1, 0.85 * w * o]}>
            <cylinderGeometry args={[0.32, 0.35, height, 18, 1, false, Math.PI * 0.12, Math.PI * 1.76]} />
            {mat}
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * (0.32 * w * o + 0.04), 0.86, 0]}
              rotation={[0, 0, side * -0.18]}
            >
              <cylinderGeometry args={[0.11 * puff, 0.12 * puff, 0.46, 12]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    }

    // ---- ワンピース ----
    case 'onepiece_mini':
    case 'onepiece_long': {
      const long = tpl.shape === 'onepiece_long';
      const hemY = (long ? 0.12 : 0.42) - len * 0.08;
      const topY = 1.12;
      return (
        <group>
          <mesh position={[0, (topY + hemY) / 2, 0]} scale={[w * over, 1, 0.85 * w * over]}>
            <cylinderGeometry args={[0.29, (long ? 0.45 : 0.4) * over, topY - hemY, 18]} />
            {mat}
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (0.3 * w + 0.05), 1.0, 0]} rotation={[0, 0, side * -0.18]}>
              <cylinderGeometry args={[0.095, 0.1, 0.18, 10]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    }

    // ---- シューズ ----
    case 'sneaker':
    case 'sneaker_volume':
    case 'loafer':
    case 'boots': {
      const vol = tpl.shape === 'sneaker_volume' ? 1.3 : 1.0;
      const hi = tpl.shape === 'boots' ? 0.22 : 0.1;
      return (
        <group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.13 * w, hi / 2 + 0.02, 0.04]}>
              <mesh scale={[0.12 * vol, hi, 0.22 * vol]}>
                <sphereGeometry args={[1, 14, 10]} />
                {mat}
              </mesh>
              {tpl.shape !== 'boots' && (
                <mesh position={[0, -hi * 0.45, 0]} scale={[0.125 * vol, 0.03, 0.23 * vol]}>
                  <sphereGeometry args={[1, 14, 10]} />
                  <meshStandardMaterial color="#F2F0EB" roughness={0.85} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      );
    }

    // ---- バッグ ----
    case 'tote':
    case 'shoulder':
    case 'minibag': {
      const size = tpl.shape === 'tote' ? 0.2 : tpl.shape === 'shoulder' ? 0.15 : 0.11;
      return (
        <group position={[0.42 * w + 0.1, 0.62, 0]}>
          <mesh scale={[size, size * 1.15, size * 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            {mat}
          </mesh>
          <mesh position={[0, size * 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size * 0.45, 0.012, 8, 16]} />
            {mat}
          </mesh>
        </group>
      );
    }

    // ---- アクセ・帽子 ----
    case 'necklace':
      return (
        <mesh position={[0, 1.08, 0.12]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.16, 0.018, 8, 20]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
        </mesh>
      );
    case 'cap':
      return (
        <group position={[0, 0.22, 0]}>
          <mesh scale={[1.04, 0.75, 1.04]}>
            <sphereGeometry args={[0.42, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.05, 0.4]} rotation={[-0.25, 0, 0]} scale={[0.3, 0.02, 0.2]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            {mat}
          </mesh>
        </group>
      );
    case 'beanie':
      return (
        <mesh position={[0, 0.2, 0]} scale={[1.05, 0.9, 1.05]}>
          <sphereGeometry args={[0.43, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          {mat}
        </mesh>
      );

    default:
      return null;
  }
}
