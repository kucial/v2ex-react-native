export default ({ config }) => {
  config.extra.buildTime = new Date().toISOString()
  return config
}
