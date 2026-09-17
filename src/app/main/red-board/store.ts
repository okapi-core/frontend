import { RES_TYPE } from '@/lib/request-types';
import { ServiceRedResponse } from '@/lib/response-types';
import { PendingAction } from '@/lib/types/state-types';
import { create } from 'zustand';

type RedBoardStore = {
  service?: string;
  peer?: string;
  resType: RES_TYPE;
  serviceRed?: ServiceRedResponse;
  serviceRedQueryStatus?: PendingAction;
  setService: (service: string) => void;
  setPeer: (peer: string) => void;
  setResType: (resType: RES_TYPE) => void;
  clearPeer: () => void;
  setServiceRed: (serviceRed: ServiceRedResponse) => void;
  setServiceRedQueryStatus: (serviceRedQueryStatus: PendingAction) => void;
};

export const useRedBoardStore = create<RedBoardStore>((set) => ({
  resType: 'SECONDLY',
  setService(service) {
    set({ service });
  },
  setPeer(peer) {
    set({ peer });
  },
  setResType(resType) {
    set({ resType });
  },
  setServiceRed(serviceRed) {
    set({ serviceRed });
  },
  setServiceRedQueryStatus(serviceRedQueryStatus) {
    set({ serviceRedQueryStatus });
  },
  clearPeer() {
    set({ peer: undefined });
  },
}));
