/// <reference types='jest' />

import * as themes from '@/containers/ThemeService/themes'
import nativeAccents from '@/containers/ThemeService/themes/native-accents.json'

/**
 * `native-accents.json` is the source the Android resources are generated from
 * at prebuild time (plugins/withThemeAccentColors.js), because a CommonJS
 * config plugin cannot import the TypeScript themes.
 *
 * That makes it a copy, and a copy can drift. These tests are the only thing
 * stopping a changed theme primary from silently leaving the native accent on
 * the old colour until someone notices a mismatched dialog.
 */

const VARIANTS = ['light', 'dark', 'pure_dark'] as const

describe('native-accents.json', () => {
  it('covers every theme', () => {
    // Enumerated the same way the settings screen lists them —
    // see src/screens/SettingsTheme/ThemePreview.tsx.
    expect(Object.keys(nativeAccents).sort()).toEqual(
      Object.values(themes)
        .map((theme) => theme.name)
        .sort(),
    )
  })

  it.each(Object.values(themes).map((theme) => [theme.name, theme] as const))(
    'matches every variant of %s',
    (name, theme) => {
      const entry = nativeAccents[name as keyof typeof nativeAccents]
      expect(entry).toBeDefined()
      for (const variant of VARIANTS) {
        expect(entry[variant]).toBe(theme[variant].colors.primary)
      }
    },
  )

  it('only holds colours Android can parse as a resource value', () => {
    // assignColorValue writes these straight into colors.xml; a non-hex value
    // (rgba(), hsl(), a named colour) would break aapt at build time rather
    // than in JS, so catch it here.
    for (const entry of Object.values(nativeAccents)) {
      for (const variant of VARIANTS) {
        expect(entry[variant]).toMatch(/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)
      }
    }
  })
})
