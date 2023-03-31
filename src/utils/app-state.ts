import { clearCookies } from 'react-native/Libraries/Network/RCTNetworking'
import RNRestart from 'react-native-restart'
import CookieManager from '@react-native-cookies/cookies'

import storage from './storage'

export const restart = async () => {
  RNRestart.Restart()
}
export const clearCache = async () => {
  const keys = storage.getAllKeys()
  keys.forEach((key) => {
    if (/\$app\$/.test(key)) {
      return
    }
    storage.delete(key)
  })
  RNRestart.Restart()
}

export const reset = async () => {
  storage.clearAll()
  await CookieManager.clearAll()
  await new Promise((resolve) => clearCookies(resolve))
  RNRestart.Restart()
}
