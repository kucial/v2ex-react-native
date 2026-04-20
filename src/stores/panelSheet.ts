import { create } from 'zustand'

import { PlanetFeedItem } from '@/utils/v2ex-client/types'

export const usePanelSheet = create<{
  data: PlanetFeedItem | null
  openPanelSheet: (data: PlanetFeedItem) => void
  closePanelSheet: () => void
}>((set) => ({
  data: null,
  openPanelSheet: (data) => set({ data }),
  closePanelSheet: () => set({ data: null }),
}))
