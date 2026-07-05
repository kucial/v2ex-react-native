import 'react-native-url-polyfill/auto'

import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'

/**
 * Downloads an image and returns the local file URI, using cache if available.
 * @param url - Image URL to download
 * @returns Local file URI
 */
export async function downloadOrUseCachedImage(url: string): Promise<string> {
  const downloadResult = await FileSystem.File.downloadFileAsync(
    url,
    FileSystem.Paths.cache,
  )
  return downloadResult.uri
}

/**
 * Extracts the file extension from a URI.
 * @param uri - The URI string
 * @param fallback - Fallback extension if none found
 * @returns The file extension
 */
export function getImgXtension(uri: string, fallback: string): string {
  const basename = getBasename(uri)
  if (/[.]/.exec(basename)) {
    return /[^.]+$/.exec(basename)[0]
  } else {
    const url = new URL(uri)
    return url.searchParams.get('format') || fallback
  }
}

/**
 * Extracts the basename from a URI.
 * @param uri - The URI string
 * @returns The basename
 */
export function getBasename(uri: string): string {
  return uri.split(/[\\/]/).pop() || ''
}

/**
 * Extracts the filename from a URI, removing query parameters.
 * @param uri - The URI string
 * @returns The filename
 */
export function getFilename(uri: string): string {
  const basename = getBasename(uri)
  return basename.split('?')[0]
}

const BASE83_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~'

function decode83(str: string): number {
  let value = 0
  for (const char of str) {
    const index = BASE83_ALPHABET.indexOf(char)
    if (index === -1) {
      throw new Error(`Invalid blurhash character: ${char}`)
    }
    value = value * 83 + index
  }
  return value
}

const srgbToLinear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

const linearToSrgb = (y: number) => {
  const c = y <= 0.0031308 ? y * 12.92 : 1.055 * Math.pow(y, 1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, c)) * 255)
}

// WCAG contrast ratio to aim for: comfortably above the 4.5:1 AA threshold.
const TARGET_CONTRAST = 9
// Background linear luminance above which dark text yields more contrast
// than light text: solves (Y+0.05)/0.05 = 1.05/(Y+0.05).
const DARK_TEXT_THRESHOLD = 0.179

/**
 * Picks a grayscale color that contrasts with a background of the given
 * average luminosity (0-255, e.g. from `getImageLuminosity`).
 *
 * Solves for the gray whose WCAG contrast ratio against the background hits
 * TARGET_CONTRAST: ambiguous mid-tone backgrounds get pushed toward pure
 * black/white, while clearly dark or light backgrounds keep a softer gray.
 *
 * @param luminosity - Average background luminosity (0-255)
 * @returns Hex grayscale color, e.g. '#c9c9c9'
 */
export function getContrastGrayscale(luminosity: number): string {
  const bgY = srgbToLinear(luminosity)
  let textY: number
  if (bgY > DARK_TEXT_THRESHOLD) {
    // dark text: contrast = (bgY + 0.05) / (textY + 0.05)
    textY = (bgY + 0.05) / TARGET_CONTRAST - 0.05
  } else {
    // light text: contrast = (textY + 0.05) / (bgY + 0.05)
    textY = TARGET_CONTRAST * (bgY + 0.05) - 0.05
  }
  const channel = linearToSrgb(textY)
  const hex = channel.toString(16).padStart(2, '0')
  return `#${hex}${hex}${hex}`
}

/**
 * Calculates the average luminosity of an image.
 *
 * Uses expo-image's blurhash encoder with a single 1x1 component: the DC
 * component of a blurhash is the image's average color, so one native call
 * (served from expo-image's cache) replaces downloading the file and
 * sampling pixels one by one over the bridge.
 *
 * @param url - Image URL to analyze
 * @returns Average luminosity value (0-255)
 */
export async function getImageLuminosity(url: string): Promise<number> {
  const blurhash = await Image.generateBlurhashAsync(url, [1, 1])
  if (!blurhash || blurhash.length < 6) {
    throw new Error(`Failed to generate blurhash for image: ${url}`)
  }
  // Blurhash layout: [size flag][quant max][4 chars average color as
  // base83-encoded 24-bit sRGB]
  const rgb = decode83(blurhash.slice(2, 6))
  const red = (rgb >> 16) & 255
  const green = (rgb >> 8) & 255
  const blue = rgb & 255
  // Rec. 601 luma
  return 0.299 * red + 0.587 * green + 0.114 * blue
}
