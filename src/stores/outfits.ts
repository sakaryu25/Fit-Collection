import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import type { Outfit } from '@/types';

interface OutfitState {
  outfits: Outfit[];
  add: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => Outfit;
  update: (id: string, patch: Partial<Outfit>) => void;
  remove: (id: string) => void;
}

export const useOutfits = create<OutfitState>()(
  persist(
    (set) => ({
      outfits: [],
      add: (outfit) => {
        const full: Outfit = { ...outfit, id: newId(), createdAt: Date.now() };
        set((s) => ({ outfits: [full, ...s.outfits] }));
        return full;
      },
      update: (id, patch) =>
        set((s) => ({ outfits: s.outfits.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      remove: (id) => set((s) => ({ outfits: s.outfits.filter((o) => o.id !== id) })),
    }),
    { name: 'fc-outfits', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
