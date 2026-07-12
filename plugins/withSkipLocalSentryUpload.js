const fs = require('node:fs')
const path = require('node:path')
const { withDangerousMod, withXcodeProject } = require('expo/config-plugins')

/**
 * Expo Config Plugin for CNG (Continuous Native Generation) workflow.
 *
 * Ensures that during local iOS builds (`expo run:ios`), Sentry debug symbols
 * and source map uploads (`Upload Debug Symbols to Sentry` script phase) are
 * skipped to avoid multi-minute build delays.
 *
 * When building in CI or EAS (`CI=true` or `EAS_BUILD=true`), symbol upload runs normally.
 */
function withSkipLocalSentryUpload(config) {
  // 1. Append SENTRY_DISABLE_AUTO_UPLOAD check to ios/.xcode.env
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const xcodeEnvPath = path.join(config.modRequest.platformProjectRoot, '.xcode.env')
      if (fs.existsSync(xcodeEnvPath)) {
        let content = fs.readFileSync(xcodeEnvPath, 'utf8')
        const skipSnippet = `\n# Skip Sentry symbol upload during local dev (CNG)\nif [ -z "$CI" ] && [ -z "$EAS_BUILD" ]; then\n  export SENTRY_DISABLE_AUTO_UPLOAD=true\nfi\n`
        if (!content.includes('SENTRY_DISABLE_AUTO_UPLOAD=true')) {
          content += skipSnippet
          fs.writeFileSync(xcodeEnvPath, content, 'utf8')
        }
      }
      return config
    },
  ])

  // 2. Ensure Xcode build phase sources .xcode.env before running sentry upload script
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults
    const buildPhases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase || {}

    for (const key of Object.keys(buildPhases)) {
      if (key.endsWith('_comment')) continue
      const phase = buildPhases[key]
      if (
        phase &&
        (phase.name === '"Upload Debug Symbols to Sentry"' ||
          phase.name === 'Upload Debug Symbols to Sentry' ||
          (phase.shellScript && phase.shellScript.includes('sentry-xcode-debug-files.sh')))
      ) {
        let script = phase.shellScript || ''
        // Remove surrounding Xcode string quotes if present for checking/modifying
        if (script.startsWith('"') && script.endsWith('"')) {
          script = JSON.parse(script)
        }
        if (!script.includes('SENTRY_DISABLE_AUTO_UPLOAD')) {
          const checkSnippet = `if [ -z "$CI" ] && [ -z "$EAS_BUILD" ]; then export SENTRY_DISABLE_AUTO_UPLOAD=true; fi\n`
          phase.shellScript = JSON.stringify(checkSnippet + script)
        }
      }
    }

    return config
  })

  return config
}

module.exports = withSkipLocalSentryUpload
