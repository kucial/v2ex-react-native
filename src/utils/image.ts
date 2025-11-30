import 'react-native-url-polyfill/auto'

import { Image, Platform } from 'react-native'
import GetPixelColor from '@thebeka/react-native-get-pixel-color'
import Color from 'color'
import * as FileSystem from 'expo-file-system'

import PixelTally from './PixelTally'

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

/**
 * Gets the size of an image from its file URI.
 * @param fileUri - The file URI
 * @returns Promise resolving to width and height
 */
async function getImageSize(
  fileUri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      fileUri,
      (width, height) => {
        resolve({
          width,
          height,
        })
      },
      reject,
    )
  })
}

type Options = {
  xStepCount?: number
  yStepCount?: number
  greyscaleDistance?: number
  start?: [number, number] // 0 - 100 [x, y]
  end?: [number, number]
}

/**
 * Calculates the average luminosity of an image by sampling pixels in a grid.
 * @param url - Image URL to analyze
 * @param options - Sampling options
 * @returns Average luminosity value (0-255)
 */
export async function getImageLuminosity(
  url: string,
  options: Options = {},
): Promise<number> {
  try {
    // Download the image
    const fileUri = await downloadOrUseCachedImage(url)

    // Extract sampling parameters
    const xStep = options.xStepCount || 5
    const yStep = options.yStepCount || 5
    const greyscaleDistance = options.greyscaleDistance || 15

    // Get image dimensions
    const { width, height } = await getImageSize(fileUri)

    // Initialize pixel tally
    const tally = new PixelTally({ greyscaleDistance })

    // Initialize pixel color library based on platform
    if (Platform.OS === 'ios') {
      await GetPixelColor.init(fileUri)
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      })
      await GetPixelColor.init(base64)
    }

    // Calculate sampling region
    const { xOffset, yOffset, xRange, yRange } = calculateSamplingRegion(
      options,
      width,
      height,
    )

    // Generate sampling points
    const samplingPoints = generateSamplingPoints(
      xOffset,
      yOffset,
      xRange,
      yRange,
      xStep,
      yStep,
    )

    // Sample pixels and record colors
    for (const { x, y } of samplingPoints) {
      const hex = await GetPixelColor.pickColorAt(x, y)
      const color = new Color(hex)
      tally.record({
        red: color.red(),
        blue: color.blue(),
        green: color.green(),
      })
    }

    return tally.getLuminosityAverage()
  } catch (error) {
    console.error('Error calculating image luminosity:', error)
    throw error
  }
}

/**
 * Calculates the sampling region based on options.
 * @param options - Sampling options
 * @param width - Image width
 * @param height - Image height
 * @returns Sampling region parameters
 */
function calculateSamplingRegion(
  options: Options,
  width: number,
  height: number,
): { xOffset: number; yOffset: number; xRange: number; yRange: number } {
  if (options.start && options.end) {
    const xOffset = (Math.min(options.start[0], options.end[0]) / 100) * width
    const yOffset = (Math.min(options.start[1], options.end[1]) / 100) * height
    const xRange = (Math.abs(options.start[0] - options.end[0]) / 100) * width
    const yRange = (Math.abs(options.start[1] - options.end[1]) / 100) * height
    return { xOffset, yOffset, xRange, yRange }
  }
  return { xOffset: 0, yOffset: 0, xRange: width, yRange: height }
}

/**
 * Generates evenly distributed sampling points within the specified region.
 * @param xOffset - X offset of the region
 * @param yOffset - Y offset of the region
 * @param xRange - Width of the region
 * @param yRange - Height of the region
 * @param xStep - Number of steps in X direction
 * @param yStep - Number of steps in Y direction
 * @returns Array of sampling points
 */
function generateSamplingPoints(
  xOffset: number,
  yOffset: number,
  xRange: number,
  yRange: number,
  xStep: number,
  yStep: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  // Calculate intervals to evenly distribute points across the range
  // For n steps, we need (n-1) intervals to span the full range
  const xInterval = xStep > 1 ? xRange / (xStep - 1) : 0
  const yInterval = yStep > 1 ? yRange / (yStep - 1) : 0

  for (let i = 0; i < xStep; i++) {
    const x = Math.round(xOffset + i * xInterval)
    for (let j = 0; j < yStep; j++) {
      const y = Math.round(yOffset + j * yInterval)
      points.push({ x, y })
    }
  }

  return points
}
