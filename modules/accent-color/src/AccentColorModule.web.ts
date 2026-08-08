import { NativeModule, registerWebModule } from 'expo'

// There is no window tint to set on the web; the app styles everything itself.
class AccentColorModule extends NativeModule<Record<string, never>> {
  setAccentColor(): boolean {
    return false
  }
}

export default registerWebModule(AccentColorModule, 'AccentColorModule')
