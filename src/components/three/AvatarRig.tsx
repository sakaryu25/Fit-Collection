import React, { useMemo } from 'react';

import type { AvatarConfig, Slot, WornItem } from '@/types';
import { Garment } from './Garments';

// デフォルメ3.5頭身アバターをプリミティブで構成。
// 単位: 身長 ≈ 2.0。将来GLB化してもpropsの契約(config/worn)は維持する。

const HEIGHT_SCALE = { short: 0.93, mid: 1.0, tall: 1.07 } as const;
const BODY_W = { slim: 0.88, normal: 1.0, wide: 1.14 } as const;
const FACE_W = { round: 1.0, oval: 0.92, sharp: 0.86 } as const;

export interface AvatarRigProps {
  config: AvatarConfig;
  worn?: Partial<Record<Slot, WornItem>>;
}

function Hair({ style, color }: { style: AvatarConfig['hairStyle']; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.85} />;
  switch (style) {
    case 'short':
      return (
        <group>
          <mesh position={[0, 0.13, -0.08]} scale={[1.06, 0.92, 1.06]}>
            <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
            {mat}
          </mesh>
        </group>
      );
    case 'bob':
      return (
        <group>
          <mesh position={[0, 0.13, -0.09]} scale={[1.08, 0.98, 1.08]}>
            <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.1, -0.2]} scale={[1.02, 0.7, 0.5]}>
            <sphereGeometry args={[0.42, 24, 16]} />
            {mat}
          </mesh>
        </group>
      );
    case 'medium':
      return (
        <group>
          <mesh position={[0, 0.13, -0.09]} scale={[1.06, 0.96, 1.06]}>
            <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.3, -0.2]} scale={[0.9, 1.0, 0.45]}>
            <sphereGeometry args={[0.42, 24, 16]} />
            {mat}
          </mesh>
        </group>
      );
    case 'long':
      return (
        <group>
          <mesh position={[0, 0.13, -0.09]} scale={[1.06, 0.96, 1.06]}>
            <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.55, -0.18]} scale={[0.75, 1.6, 0.4]}>
            <sphereGeometry args={[0.42, 24, 16]} />
            {mat}
          </mesh>
        </group>
      );
    case 'bun':
      return (
        <group>
          <mesh position={[0, 0.13, -0.08]} scale={[1.05, 0.9, 1.05]}>
            <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.46, -0.1]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            {mat}
          </mesh>
        </group>
      );
    case 'curly':
      return (
        <group>
          {[[-0.22, 0.18], [0, 0.3], [0.22, 0.18], [-0.3, -0.05], [0.3, -0.05]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, -0.05]}>
              <sphereGeometry args={[0.24, 16, 12]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
  }
}

function Face({ config }: { config: AvatarConfig }) {
  const eyeY = 0.02;
  const eyeX = 0.16;
  const eyeZ = 0.36;
  return (
    <group>
      {/* 目 */}
      {[-eyeX, eyeX].map((x, i) => (
        <mesh
          key={i}
          position={[x, eyeY, eyeZ]}
          scale={
            config.eyes === 'round' ? [1, 1, 0.5]
            : config.eyes === 'oval' ? [1, 0.75, 0.5]
            : [1.2, 0.28, 0.5]
          }
        >
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#26201C" roughness={0.4} />
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
        position={[0, -0.14, 0.37]}
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
      {/* ===== 頭 (y: 1.45 中心, 半径0.42) ===== */}
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
