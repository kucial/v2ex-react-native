import { BarcodeScanningResult } from 'expo-camera'

export type ImageResource = {
  origin: string
  local?: string
}

export type GlobalImageViewingState = {
  visible: boolean
  viewIndex: number
  images: ImageResource[]
  handleQrCode?: (data: BarcodeScanningResult) => void
  open: (
    viewIndex: number,
    images: ImageResource[],
    handleQrCode?: (data: BarcodeScanningResult) => void,
  ) => void
  close: () => void
}

export type ImageViewingService = {
  add(info: { origin: string; local?: string }): void
  update(info: { origin: string; local: string }): void
  remove(url: string): void
  open(url: string): void
}
