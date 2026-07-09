import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Grocery } from '../types';

interface ComparisonState {
  items: Grocery[];
  add: (grocery: Grocery) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      items: [],
      add: (grocery) =>
        set((state) => ({
          items: [...state.items, grocery],
        })),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((g) => g.id !== id),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'compear-comparison',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
