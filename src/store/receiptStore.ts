import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavedReceipt } from '../api/client';

interface ReceiptState {
  receipts: SavedReceipt[];
  upsert: (receipt: SavedReceipt) => void;
  remove: (id: string) => void;
  setAll: (receipts: SavedReceipt[]) => void;
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set) => ({
      receipts: [],
      upsert: (receipt) =>
        set((state) => {
          const rest = state.receipts.filter((r) => r.id !== receipt.id);
          return { receipts: [receipt, ...rest].slice(0, 200) };
        }),
      remove: (id) =>
        set((state) => ({
          receipts: state.receipts.filter((r) => r.id !== id),
        })),
      setAll: (receipts) => set({ receipts }),
    }),
    { name: 'compear-receipts' }
  )
);
