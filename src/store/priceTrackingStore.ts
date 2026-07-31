import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PriceSnapshot {
  recordedAt: string;
  lowPrice: number;
  highPrice: number;
  offerCount: number;
}

export interface TrackedPrice {
  key: string;
  country: string;
  slug: string;
  productName: string;
  targetPrice: number | null;
  history: PriceSnapshot[];
}

interface PriceTrackingState {
  tracked: TrackedPrice[];
  record: (entry: Omit<TrackedPrice, 'targetPrice' | 'history'>, snapshot: PriceSnapshot) => void;
  setTarget: (key: string, targetPrice: number | null) => void;
  remove: (key: string) => void;
}

export const usePriceTrackingStore = create<PriceTrackingState>()(
  persist(
    (set) => ({
      tracked: [],
      record: (entry, snapshot) =>
        set((state) => {
          const existing = state.tracked.find((item) => item.key === entry.key);
          if (!existing) {
            return { tracked: [...state.tracked, { ...entry, targetPrice: null, history: [snapshot] }] };
          }
          const latest = existing.history[existing.history.length - 1];
          const sameDay = latest?.recordedAt.slice(0, 10) === snapshot.recordedAt.slice(0, 10);
          const history = sameDay
            ? [...existing.history.slice(0, -1), snapshot]
            : [...existing.history, snapshot].slice(-90);
          return {
            tracked: state.tracked.map((item) => item.key === entry.key ? { ...item, ...entry, history } : item),
          };
        }),
      setTarget: (key, targetPrice) =>
        set((state) => ({
          tracked: state.tracked.map((item) => item.key === key ? { ...item, targetPrice } : item),
        })),
      remove: (key) => set((state) => ({ tracked: state.tracked.filter((item) => item.key !== key) })),
    }),
    { name: 'compear-price-tracking' }
  )
);
