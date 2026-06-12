import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_AVATAR, type AvatarConfig } from '@/types';

interface AvatarState {
  config: AvatarConfig;
  created: boolean; // 初回作成済みか（オンボーディング判定）
  set: (patch: Partial<AvatarConfig>) => void;
  markCreated: () => void;
  randomize: () => void;
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export const useAvatar = create<AvatarState>()(
  persist(
    (set) => ({
      config: DEFAULT_AVATAR,
      created: false,
      set: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      markCreated: () => set({ created: true }),
      randomize: () =>
        set(() => ({
          config: {
            skinColor: pick(['#FBE3CC', '#F2C9A8', '#E0AC85', '#C68B62', '#9D6845', '#6F4A30']),
            faceShape: pick(['round', 'oval', 'sharp'] as const),
            eyes: pick(['round', 'oval', 'line'] as const),
            mouth: pick(['smile', 'small', 'open'] as const),
            hairStyle: pick(['short', 'bob', 'medium', 'long', 'bun', 'curly'] as const),
            hairColor: pick(['#1C1C1C', '#3B2B20', '#5C4330', '#8B6242', '#B58A5C', '#D9B88A', '#8E8E8E', '#C46A6A']),
            bodyType: pick(['slim', 'normal', 'wide'] as const),
            height: pick(['short', 'mid', 'tall'] as const),
          },
        })),
    }),
    { name: 'fc-avatar', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
