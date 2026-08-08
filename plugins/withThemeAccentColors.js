const {
  AndroidConfig,
  WarningAggregator,
  withAndroidColors,
  withAndroidStyles,
} = require('expo/config-plugins')

const accents = require('../src/containers/ThemeService/themes/native-accents.json')

/**
 * Generates one Android colour and one style per theme + variant, so the app
 * can point the activity theme at the active accent at runtime.
 *
 * Android resolves `colorPrimary` / `colorAccent` as theme attributes, so —
 * unlike iOS, where the native module just sets a window tint from a hex — the
 * accent has to exist as a style resource before it can be applied. The module
 * (`modules/accent-color`) looks these up by name via `getIdentifier`.
 *
 * Every combination is emitted explicitly rather than relying on
 * `values-night`: the app has its own light/dark theme settings that can
 * diverge from the system, plus a `pure_dark` variant that `values-night`
 * cannot express at all.
 *
 * `native-accents.json` is kept honest against the real themes by
 * src/containers/ThemeService/__test__/native-accents.test.ts.
 */

const VARIANTS = ['light', 'dark', 'pure_dark']

/** Must match `androidAccentStyle` in modules/accent-color/index.ts. */
const styleName = (theme, variant) => `app_accent_${theme}_${variant}`
const colorName = (theme, variant) => `accent_${theme}_${variant}`

function eachAccent(callback) {
  for (const [theme, variants] of Object.entries(accents)) {
    for (const variant of VARIANTS) {
      const value = variants[variant]
      if (typeof value === 'string' && value) {
        callback(theme, variant, value)
      }
    }
  }
}

function withThemeAccentColors(config) {
  config = withAndroidColors(config, (config) => {
    eachAccent((theme, variant, value) => {
      config.modResults = AndroidConfig.Colors.assignColorValue(
        config.modResults,
        { name: colorName(theme, variant), value },
      )
    })
    return config
  })

  config = withAndroidStyles(config, (config) => {
    const resources = config.modResults?.resources
    if (!resources) {
      WarningAggregator.addWarningAndroid(
        'withThemeAccentColors',
        'styles.xml had no <resources> root; accent styles were not generated.',
      )
      return config
    }

    const generated = new Set()
    eachAccent((theme, variant) => generated.add(styleName(theme, variant)))

    // Drop our own previous output first so a re-run cannot duplicate it, and
    // so a theme removed from the manifest does not linger as a dead style.
    const kept = (resources.style ?? []).filter(
      (style) => !generated.has(style?.$?.name),
    )

    const added = []
    eachAccent((theme, variant) => {
      added.push({
        $: { name: styleName(theme, variant), parent: 'AppTheme' },
        item: [
          {
            $: { name: 'colorPrimary' },
            _: `@color/${colorName(theme, variant)}`,
          },
          {
            $: { name: 'colorAccent' },
            _: `@color/${colorName(theme, variant)}`,
          },
        ],
      })
    })

    resources.style = [...kept, ...added]
    return config
  })

  return config
}

module.exports = withThemeAccentColors
