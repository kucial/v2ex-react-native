import { Platform } from 'react-native'

export const USER_AGENT_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1' +
  ' - R2V'
export const USER_AGENT_ANDROID =
  'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'

export const USER_AGENT = Platform.select({
  ios: USER_AGENT_IOS,
  android: USER_AGENT_ANDROID,
})

export const CONTENT_CONTAINER_MAX_WIDTH = 600
export const APP_SIDEBAR_SIZE = 68
