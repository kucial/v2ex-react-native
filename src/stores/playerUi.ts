import { create } from 'zustand'

export type PlayerSection = 'queue' | 'resources' | 'history'

type PlayerUiState = {
  expanded: boolean
  section: PlayerSection
  expand: () => void
  collapse: () => void
  setSection: (section: PlayerSection) => void
}

/**
 * Ephemeral UI state for the expanded player overlay. Kept out of
 * `audioPlayer` so that presentation changes don't churn playback subscribers.
 */
export const usePlayerUiStore = create<PlayerUiState>((set) => ({
  expanded: false,
  section: 'queue',
  expand: () => set({ expanded: true }),
  collapse: () => set({ expanded: false }),
  setSection: (section) => set({ section }),
}))
