import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type ViewStyle } from 'react-native';

import type { AvatarConfig, Slot, WornItem } from '@/types';
import { AvatarRig } from './AvatarRig';
import { Canvas } from './canvas';

export type ViewerMode = 'room' | 'tryon' | 'creator' | 'mini';

interface AvatarViewerProps {
  config: AvatarConfig;
  worn?: Partial<Record<Slot, WornItem>>;
  mode?: ViewerMode;
  style?: ViewStyle;
  rotatable?: boolean;
}

const CAMERA: Record<ViewerMode, { position: [number, number, number]; fov: number }> = {
  room: { position: [0, 1.2, 7], fov: 38 },
  tryon: { position: [0, 1.0, 6.2], fov: 36 },
  creator: { position: [0, 1.05, 7.2], fov: 34 },
  mini: { position: [0, 1.0, 6.4], fov: 34 },
};

export function AvatarViewer({ config, worn = {}, mode = 'tryon', style, rotatable = true }: AvatarViewerProps) {
  const [rotY, setRotY] = useState(0);
  const rotYRef = useRef(0);
  rotYRef.current = rotY;
  const startRot = useRef(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderGrant: () => {
        startRot.current = rotYRef.current;
      },
      onPanResponderMove: (_, g) => {
        setRotY(startRot.current + g.dx * 0.012);
      },
    }),
  );

  const cam = CAMERA[mode];

  return (
    <View style={[styles.container, style]} {...(rotatable ? pan.current.panHandlers : {})}>
      <Canvas camera={{ position: cam.position, fov: cam.fov }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[2, 4, 3]} intensity={1.1} />
        <directionalLight position={[-2, 2, -2]} intensity={0.3} />
        <group rotation={[0, rotY, 0]}>
          <AvatarRig config={config} worn={worn} />
          {/* 丸影 */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55, 24]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.07} />
          </mesh>
        </group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
