import { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import { create } from 'zustand';
import { getDefaultTimeRange } from './lib';

type DashboardEditStoreState = {
  timeRange: TimeRange;
  varsCtx: { [key: string]: string };
  manageVarsOpen: boolean;
  setTimeRange: (range: TimeRange) => void;
  setVarsCtx: (vars: { [key: string]: string }) => void;
  setManageVarsOpen: (open: boolean) => void;
};

export const useDashboardEditStore = create<DashboardEditStoreState>((set) => ({
  timeRange: getDefaultTimeRange(),
  varsCtx: {},
  manageVarsOpen: false,
  setTimeRange: (timeRange) => set({ timeRange }),
  setVarsCtx: (varsCtx) => set({ varsCtx }),
  setManageVarsOpen: (manageVarsOpen) => set({ manageVarsOpen }),
}));
