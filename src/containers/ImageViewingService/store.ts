import { create } from 'zustand'

import type { GlobalImageViewingState, ImageResource } from './types'

type ImageRegistryState = {
  // Global image registry: all images across all HtmlRender instances,
  // keyed by origin URL.  Replaces the per-HtmlRender ImageViewingServiceProvider
  // local state so we can remove the per-row Provider mount entirely.
  registry: Map<string, ImageResource>
  addImage: (info: ImageResource) => void
  updateImage: (info: ImageResource) => void
  removeImage: (origin: string) => void
}

type FullStore = GlobalImageViewingState & ImageRegistryState

export const useGlobalImageViewing = create<FullStore>((set, get) => ({
  // ── viewer state ──────────────────────────────────────────────────────────
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

  // ── image registry ────────────────────────────────────────────────────────
  registry: new Map(),

  addImage: (info) => {
    const { registry } = get()
    if (registry.has(info.origin)) return
    const next = new Map(registry)
    next.set(info.origin, info)
    set({ registry: next })
  },

  updateImage: (info) => {
    const { registry } = get()
    if (!registry.has(info.origin)) return
    const next = new Map(registry)
    next.set(info.origin, info)
    set({ registry: next })
  },

  removeImage: (origin) => {
    const { registry } = get()
    if (!registry.has(origin)) return
    const next = new Map(registry)
    next.delete(origin)
    set({ registry: next })
  },
}))

/**
 * Open the image viewer starting at `origin` URL.
 * Collects the ordered image list from the current registry at call time.
 * @param origin - The URL of the image that was tapped.
 * @param orderedOrigins - Ordered list of origin URLs for this HtmlRender
 *   instance (collected by ImageRenderer at mount time).
 * @param handleQrCode - Optional QR handler from the HtmlRender instance.
 */
export function openImageViewer(
  origin: string,
  orderedOrigins: string[],
  handleQrCode?: (data: any) => void,
) {
  const { registry, open } = useGlobalImageViewing.getState()
  const images = orderedOrigins
    .filter((o) => registry.has(o))
    .map((o) => registry.get(o)!)
  if (images.length === 0) {
    open(0, [{ origin }], handleQrCode)
    return
  }
  const index = images.findIndex((img) => img.origin === origin)
  open(index >= 0 ? index : 0, images, handleQrCode)
}
