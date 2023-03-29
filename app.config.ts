import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    config.extra.buildTag =
      '#' + process.env.EAS_BUILD_GIT_COMMIT_HASH.slice(0, 7)
  } else {
    config.extra.buildTag = new Date().toISOString()
  }

  return config as ExpoConfig
}
