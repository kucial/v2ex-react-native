import { create } from 'zustand'

import type { GlobalImageViewingState } from './types'

export const useGlobalImageViewing = create<GlobalImageViewingState>((set) => ({
  visible: false,
  viewIndex: -1,
  images: [],
  handleQrCode: undefined,
  open: (viewIndex, images, handleQrCode) =>
    set({ visible: true, viewIndex, images, handleQrCode }),
  close: () =>
    set({
      visible: false,
      viewIndex: -1,
      images: [],
      handleQrCode: undefined,
    }),
}))
