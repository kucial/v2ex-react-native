import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  config.extra.buildTime = new Date().toISOString()
  return config as ExpoConfig
}
