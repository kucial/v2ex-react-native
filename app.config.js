export default ({ config }) => {
  // sentry source map
  const sentryRelease = {
    file: 'sentry-expo/upload-sourcemaps',
    config: {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN
    }
  }
  config.extra.revisionId = new Date().toISOString()

  config.hooks.postPublish.push(sentryRelease)

  return config
}
