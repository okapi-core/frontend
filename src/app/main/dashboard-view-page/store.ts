import { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import { create } from 'zustand';
import { getDefaultTimeRange } from './lib';

type DashboardViewStoreState = {
  timeRange: TimeRange;
  varsCtx: { [key: string]: string };
  setTimeRange: (range: TimeRange) => void;
  setVarsCtx: (vars: { [key: string]: string }) => void;
};

export const useDashboardViewStore = create<DashboardViewStoreState>((set) => ({
  timeRange: getDefaultTimeRange(),
  varsCtx: {},
  setTimeRange: (timeRange) => set({ timeRange }),
  setVarsCtx: (varsCtx) => set({ varsCtx }),
}));
