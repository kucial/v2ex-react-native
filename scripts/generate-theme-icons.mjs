/**
 * Generates an Icon Composer `.icon` bundle per theme from the flat theme
 * PNGs in src/assets/icons, reusing the layer definition of the primary
 * src/assets/r2v-icon.icon bundle.
 *
 * Output: src/assets/icons/composer/AppIcon-<theme>.icon
 * (The `AppIcon-` prefix matches the alternate-icon naming used by
 * @howincodes/expo-dynamic-app-icon's setAppIcon at runtime.)
 *
 * Run: node scripts/generate-theme-icons.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const THEMES = [
  'gin_blue',
  'gin_dark_purple',
  'gin_purple',
  'gin_green',
  'gin_teal',
  'gin_red',
  'gin_orange',
  'gin_yellow',
  'gin_pink',
]

const sourceIconJson = join(root, 'src/assets/r2v-icon.icon/icon.json')
const iconsDir = join(root, 'src/assets/icons')
const outDir = join(iconsDir, 'composer')

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

for (const theme of THEMES) {
  const light = join(iconsDir, `icon-${theme}-light.png`)
  const dark = join(iconsDir, `icon-${theme}-dark.png`)
  if (!existsSync(light) || !existsSync(dark)) {
    console.warn(`[skip] missing PNGs for theme "${theme}"`)
    continue
  }
  const bundle = join(outDir, `AppIcon-${theme}.icon`)
  mkdirSync(join(bundle, 'Assets'), { recursive: true })
  cpSync(sourceIconJson, join(bundle, 'icon.json'))
  cpSync(light, join(bundle, 'Assets', 'light.png'))
  cpSync(dark, join(bundle, 'Assets', 'dark.png'))
  // no per-theme tinted artwork; the dark variant reads best when tinted
  cpSync(dark, join(bundle, 'Assets', 'tinted.png'))
  console.log(`[ok] ${bundle}`)
}
