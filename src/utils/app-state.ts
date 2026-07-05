import Networking from 'react-native/Libraries/Network/RCTNetworking'
import CookieManager from 'react-native-nitro-cookies'
import RNRestart from 'react-native-restart'

import { storage } from './storage'

export const restart = async () => {
  RNRestart.Restart()
}
export const clearCache = async () => {
  const keys = storage.getAllKeys()
  keys.forEach((key) => {
    if (/\$app\$/.test(key)) {
      return
    }
    storage.remove(key)
  })
  RNRestart.Restart()
}

export const reset = async () => {
  storage.clearAll()
  await CookieManager.clearAll(true)
  await new Promise((resolve) => Networking.clearCookies(resolve))
  RNRestart.Restart()
}
