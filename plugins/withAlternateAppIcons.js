const fs = require('node:fs')
const path = require('node:path')

const {
  IOSConfig,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins')

/**
 * Registers Icon Composer `.icon` bundles as iOS alternate app icons.
 *
 * Mirrors what @expo/prebuild-config does for the primary `ios.icon`:
 * copies each bundle into ios/<Project>/ and adds it as a resource build
 * file, then lists the bundle names in
 * ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES so actool compiles them as
 * alternates. Switch at runtime with
 * UIApplication.setAlternateIconName(<bundle name>) — e.g. via
 * @howincodes/expo-dynamic-app-icon's setAppIcon.
 *
 * @param config Expo config
 * @param props.icons Paths (relative to the project root) of `.icon`
 *   bundles; the file basename becomes the alternate icon name.
 */
function withAlternateAppIcons(config, { icons = [] } = {}) {
  const iconNames = icons.map((iconPath) => path.basename(iconPath, '.icon'))

  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(
        config.modRequest.projectRoot,
      )
      const iosNamedProjectRoot = path.join(
        config.modRequest.platformProjectRoot,
        projectName,
      )
      for (const iconPath of icons) {
        const source = path.join(config.modRequest.projectRoot, iconPath)
        if (!fs.existsSync(source)) {
          throw new Error(`[withAlternateAppIcons] not found: ${iconPath}`)
        }
        const target = path.join(iosNamedProjectRoot, path.basename(iconPath))
        await fs.promises.rm(target, { recursive: true, force: true })
        await fs.promises.cp(source, target, { recursive: true })
      }
      return config
    },
  ])

  config = withXcodeProject(config, (config) => {
    const project = config.modResults
    const projectName = IOSConfig.XcodeUtils.getProjectName(
      config.modRequest.projectRoot,
    )

    for (const name of iconNames) {
      const filepath = `${projectName}/${name}.icon`
      if (!project.hasFile(filepath)) {
        IOSConfig.XcodeUtils.addResourceFileToGroup({
          filepath,
          groupName: projectName,
          project,
          isBuildFile: true,
          verbose: true,
        })
      }
    }

    const buildSettingValue = `"${iconNames.join(' ')}"`
    const configurations = project.pbxXCBuildConfigurationSection()
    for (const key of Object.keys(configurations)) {
      const buildSettings = configurations[key]?.buildSettings
      if (buildSettings?.ASSETCATALOG_COMPILER_APPICON_NAME) {
        buildSettings.ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES =
          buildSettingValue
      }
    }
    return config
  })

  return config
}

module.exports = withAlternateAppIcons
