import { createContext } from 'react'
import type { BarcodeScanningResult } from 'expo-camera'

type RenderContextType = {
  handleUrlPress: (args: {
    interaction: 'default' | 'preview' | 'default'
    url: string
  }) => void
  // handleSelection: (args: { eventType: string; content: string }) => void
  // menuItems: string[]

  /**
   * QR code handler for the current HtmlRender instance.
   * Passed through context so ImageRenderer can hand it off to the global
   * image viewer when opening, without needing a per-HtmlRender Provider.
   */
  handleQrCode?: (result: BarcodeScanningResult) => void

  /**
   * Ordered list of image origin URLs registered by ImageRenderer instances
   * within this HtmlRender. Used to build the full image carousel when the
   * viewer is opened.
   */
  imageOrigins: React.MutableRefObject<string[]>
}

export const RenderContext = createContext<RenderContextType>(
  {} as RenderContextType,
)
export const SelectableTextAncestor = createContext(false)
