import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import type { ClosetItem } from '@/types';

interface ClosetState {
  items: ClosetItem[];
  add: (item: Omit<ClosetItem, 'id' | 'createdAt'>) => ClosetItem;
  update: (id: string, patch: Partial<ClosetItem>) => void;
  remove: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useCloset = create<ClosetState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => {
        const full: ClosetItem = { ...item, id: newId(), createdAt: Date.now() };
        set((s) => ({ items: [full, ...s.items] }));
        return full;
      },
      update: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggleFavorite: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i)),
        })),
    }),
    { name: 'fc-closet', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
