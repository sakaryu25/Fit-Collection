import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { AvatarConfig, Slot, WornItem } from '@/types';
import { AvatarRig } from './AvatarRig';
import { Canvas } from './canvas';

// マイルーム: 白・グレー・ベージュ基調のワンルーム。
// MVPはプリミティブ家具。将来 room.glb に差し替える。

const WALL = '#F2F0EC';
const FLOOR = '#D9CFC2';
const WOOD = '#B9A68E';
const DARK = '#3A3733';

function Closet() {
  return (
    <group position={[-1.7, 0, -1.1]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.1, 2.2, 0.55]} />
        <meshStandardMaterial color="#E7E2DA" roughness={0.9} />
      </mesh>
      {/* 扉の取っ手と隙間 */}
      <mesh position={[0, 1.1, 0.281]}>
        <boxGeometry args={[0.02, 2.0, 0.01]} />
        <meshStandardMaterial color="#C9C2B6" />
      </mesh>
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.29]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      ))}
    </group>
  );
}

function Mirror() {
  return (
    <group position={[1.75, 0, -1.05]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 0.95, 0]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.62, 1.8, 0.05]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.95, 0.03]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.5, 1.66, 0.01]} />
        <meshStandardMaterial color="#CFE0E8" roughness={0.15} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Furniture() {
  return (
    <group>
      {/* ベッド */}
      <group position={[1.2, 0, 0.9]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[1.2, 0.36, 1.9]} />
          <meshStandardMaterial color="#EFEAE2" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.4, -0.6]}>
          <boxGeometry args={[0.9, 0.12, 0.45]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
      </group>
      {/* ラグ */}
      <mesh position={[-0.3, 0.01, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 28]} />
        <meshStandardMaterial color="#E5DCD0" roughness={1} />
      </mesh>
      {/* 観葉植物 */}
      <group position={[-1.85, 0, 0.4]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.13, 0.1, 0.28, 12]} />
          <meshStandardMaterial color="#C9B8A8" roughness={0.9} />
        </mesh>
        {[[0, 0.45, 0], [-0.1, 0.38, 0.05], [0.1, 0.4, -0.05]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#5B7D5E" roughness={0.95} />
          </mesh>
        ))}
      </group>
      {/* 服ラック */}
      <group position={[-0.6, 0, -1.25]}>
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
        <mesh position={[0, 1.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.94, 8]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
        {/* 掛かっている服 */}
        {[['#1A1A1A', -0.25], ['#F5F5F2', 0], ['#C9B8A8', 0.25]].map(([c, x], i) => (
          <mesh key={i} position={[x as number, 1.05, 0]}>
            <boxGeometry args={[0.2, 0.5, 0.06]} />
            <meshStandardMaterial color={c as string} roughness={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface RoomSceneProps {
  config: AvatarConfig;
  worn?: Partial<Record<Slot, WornItem>>;
  style?: ViewStyle;
}

export function RoomScene({ config, worn = {}, style }: RoomSceneProps) {
  return (
    <View style={[styles.container, style]}>
      <Canvas camera={{ position: [0, 2.6, 5.8], fov: 42, rotation: [-0.3, 0, 0] }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 2]} intensity={0.9} />
        <directionalLight position={[-3, 3, 4]} intensity={0.35} />

        {/* 床と壁 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.4, 3.2]} />
          <meshStandardMaterial color={FLOOR} roughness={1} />
        </mesh>
        <mesh position={[0, 1.5, -1.6]}>
          <planeGeometry args={[4.4, 3]} />
          <meshStandardMaterial color={WALL} roughness={1} />
        </mesh>
        <mesh position={[-2.2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.2, 3]} />
          <meshStandardMaterial color="#EAE7E1" roughness={1} />
        </mesh>
        {/* 窓 */}
        <mesh position={[0.6, 1.8, -1.59]}>
          <planeGeometry args={[1.1, 0.9]} />
          <meshStandardMaterial color="#D7E6EE" roughness={0.4} />
        </mesh>

        <Closet />
        <Mirror />
        <Furniture />

        {/* アバター */}
        <group position={[0.1, 0, 0.2]} rotation={[0, 0.15, 0]}>
          <AvatarRig config={config} worn={worn} />
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 24]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.08} />
          </mesh>
        </group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
