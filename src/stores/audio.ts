import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'

export interface AudioItem {
  title: string
  url: string
  artist?: string
  artworkUrl?: string
  sourceUrl?: string
}

export interface AudioHistoryItem extends AudioItem {
  lastPosition: number
  duration: number
  updatedAt: number
}

export interface AudioResourceItem extends AudioItem {
  discoveredAt: number
}

type AudioState = {
  history: Record<string, AudioHistoryItem>
  resources: Record<string, AudioResourceItem>
}

type AudioStore = AudioState & {
  updateHistory: (item: AudioItem, position: number, duration: number) => void
  clearHistory: () => void
  getHistoryList: () => AudioHistoryItem[]
  addResources: (items: AudioItem[]) => void
}

const AUDIO_CACHE_KEY = '$app$/audio-history'

const INIT_AUDIO_STATE: AudioState = {
  history: {},
  resources: {},
}

export const useAudioStore = create<AudioStore>()(
  remoteDevtools(
    persist(
      (set, get) => ({
        ...INIT_AUDIO_STATE,
        updateHistory: (item, position, duration) => {
          set((prev) => {
            const updatedHistory = { ...prev.history }
            updatedHistory[item.url] = {
              ...item,
              lastPosition: position,
              duration,
              updatedAt: Date.now(),
            }
            return {
              ...prev,
              history: updatedHistory,
            }
          })
        },
        clearHistory: () => set((prev) => ({ ...prev, history: {} })),
        getHistoryList: () => {
          const { history } = get()
          return Object.values(history).sort(
            (a, b) => b.updatedAt - a.updatedAt,
          )
        },
        addResources: (items: AudioItem[]) => {
          if (!items || items.length === 0) return
          set((prev) => {
            const updatedResources = { ...prev.resources }
            let hasChanges = false
            const now = Date.now()
            items.forEach((item) => {
              const existing = updatedResources[item.url]
              if (!existing) {
                updatedResources[item.url] = {
                  ...item,
                  discoveredAt: now,
                }
                hasChanges = true
              } else {
                let changed = false
                const merged = { ...existing }
                for (const key of Object.keys(item) as (keyof AudioItem)[]) {
                  if (item[key] !== undefined && item[key] !== existing[key]) {
                    merged[key] = item[key] as any
                    changed = true
                  }
                }
                if (changed) {
                  updatedResources[item.url] = merged
                  hasChanges = true
                }
              }
            })
            if (!hasChanges) return prev
            return {
              ...prev,
              resources: updatedResources,
            }
          })
        },
      }),
      {
        name: AUDIO_CACHE_KEY,
        storage: createJSONStorage(() => stateStorage),
        partialize: (state) => ({
          history: state.history,
          resources: state.resources,
        }),
      },
    ),
    {
      name: 'audio-store',
    },
  ),
)

export function useAudioResourceInterceptor(pages?: any[]) {
  useEffect(() => {
    if (!pages) return
    const newItems: AudioItem[] = []
    pages.forEach((page) => {
      page?.data?.forEach((item: any) => {
        if (item.audio && item.audio.url) {
          newItems.push({
            url: item.audio.url,
            title: item.audio.title || item.title || 'Audio',
            artist: item.audio.author || item.planet?.site_title,
          })
        }
      })
    })
    if (newItems.length > 0) {
      useAudioStore.getState().addResources(newItems)
    }
  }, [pages])
}
