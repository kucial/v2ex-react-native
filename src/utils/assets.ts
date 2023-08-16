import { Platform } from 'react-native'
export const staticAsset = (name: string) => {
  if (Platform.OS === 'ios') {
    return `Static.bundle/${name}`
  }
  return `asset:/${name}`
}
