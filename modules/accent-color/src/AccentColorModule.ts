import { NativeModule, requireNativeModule } from 'expo'

declare class AccentColorModule extends NativeModule<Record<string, never>> {
  /**
   * @param hex `#RRGGBB` or `#RRGGBBAA`. Used on iOS for the window tint.
   * @param androidStyle Name of a generated style resource. Used on Android,
   *   where the accent has to come from a style rather than a colour value.
   * @returns whether the accent was applied.
   */
  setAccentColor(hex: string, androidStyle?: string): boolean
}

export default requireNativeModule<AccentColorModule>('AccentColor')
