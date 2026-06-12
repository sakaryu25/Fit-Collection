import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import type { WishStatus } from '@/constants/taxonomy';
import type { WishlistItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  add: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'tryOnCount' | 'status'> & { status?: WishStatus }) => WishlistItem;
  update: (id: string, patch: Partial<WishlistItem>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: WishStatus) => void;
  recordTryOn: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => {
        const full: WishlistItem = {
          status: 'want',
          ...item,
          id: newId(),
          tryOnCount: 0,
          createdAt: Date.now(),
        };
        set((s) => ({ items: [full, ...s.items] }));
        return full;
      },
      update: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, status } : i)) })),
      recordTryOn: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, tryOnCount: i.tryOnCount + 1 } : i)),
        })),
    }),
    { name: 'fc-wishlist', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
