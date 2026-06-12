import { create } from 'zustand';

import type { Outfit, Slot, WornItem } from '@/types';

interface TryOnState {
  slots: Partial<Record<Slot, WornItem>>;
  wear: (slot: Slot, item: WornItem) => void;
  removeSlot: (slot: Slot) => void;
  reset: () => void;
  loadItems: (entries: { slot: Slot; item: WornItem }[]) => void;
}

export const useTryOn = create<TryOnState>()((set) => ({
  slots: {},
  wear: (slot, item) =>
    set((s) => {
      const next = { ...s.slots, [slot]: item };
      // ワンピースはトップス/ボトムスと排他
      if (slot === 'onepiece') {
        delete next.tops;
        delete next.bottoms;
      }
      if (slot === 'tops' || slot === 'bottoms') {
        delete next.onepiece;
      }
      return { slots: next };
    }),
  removeSlot: (slot) =>
    set((s) => {
      const next = { ...s.slots };
      delete next[slot];
      return { slots: next };
    }),
  reset: () => set({ slots: {} }),
  loadItems: (entries) =>
    set(() => {
      const slots: Partial<Record<Slot, WornItem>> = {};
      for (const { slot, item } of entries) slots[slot] = item;
      return { slots };
    }),
}));

export function outfitToEntries(outfit: Outfit, lookOf: (source: 'closet' | 'wishlist', id: string) => WornItem | null) {
  return outfit.items
    .map((ref) => {
      const item = lookOf(ref.source, ref.itemId);
      return item ? { slot: ref.slot, item } : null;
    })
    .filter((e): e is { slot: Slot; item: WornItem } => e !== null);
}
