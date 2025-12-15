import { create } from 'zustand'

import { PlanetFeedItem } from '@/utils/v2ex-client/types'

export const usePanelSheet = create<{
  isOpen: boolean
  data: PlanetFeedItem | null
  openPanelSheet: (data: PlanetFeedItem) => void
  closePanelSheet: () => void
}>((set) => ({
  isOpen: false,
  data: null,
  openPanelSheet: (data) => set({ isOpen: true, data }),
  closePanelSheet: () => set({ isOpen: false, data: null }),
}))
