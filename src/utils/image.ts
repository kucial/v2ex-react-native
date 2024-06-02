import 'react-native-url-polyfill/auto'

import { Image, Platform } from 'react-native'
import GetPixelColor from '@thebeka/react-native-get-pixel-color'
import Color from 'color'
import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import * as Sentry from 'sentry-expo'

import PixelTally from './PixelTally'

const imageDir = FileSystem.cacheDirectory + '.image_cache/'

export function getImgXtension(uri: string, fallback: string) {
  const basename = getBasename(uri)
  if (/[.]/.exec(basename)) {
    return /[^.]+$/.exec(basename)[0]
  } else {
    const url = new URL(uri)
    return url.searchParams.get('format') || fallback
  }
}
export function getBasename(uri: string) {
  return uri.split(/[\\/]/).pop()
}

export function getFilename(uri: string) {
  const basename = getBasename(uri)
  return basename.split('?')[0]
}

export const getImagePath = async (link: string) => {
  const ext = getImgXtension(link, 'png')

  let path: string
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      link,
    )
    const filename = getFilename(link)
    path = `${filename.replace(`.${ext}`, '')}_${hash.slice(0, 8)}.${ext}`
  } catch (err) {
    Sentry.Native.captureException(err)
    const url = new URL(link)
    url.searchParams.delete('format')
    path = `${url.hostname.replace(/\./g, '_')}_${url.pathname
      .replace(/\//g, '_')
      .replace(/%20/g, '_')
      .replace(`.${ext}`, '')}${url.search.replace(/^\?(.*)/, '[$1]')}.${ext}`
  }

  return imageDir + path
}

async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(imageDir)
  if (!dirInfo.exists) {
    console.log("Image directory doesn't exist, creating...")
    await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true })
  }
}

export async function downloadImage(url: string) {
  await ensureDirExists()
  const fileUri = await getImagePath(url)
  const fileInfo = await FileSystem.getInfoAsync(fileUri)

  if (!fileInfo.exists) {
    // console.log(fileUri, " isn't cached locally. Downloading...")
    await FileSystem.downloadAsync(url, fileUri)
    // console.log(fileUri, ' downloaded')
  }

  return fileUri
}

// Exports shareable URI - it can be shared outside your app
export async function getImageContentUri(url: string) {
  if (url.startsWith('file:')) {
    return FileSystem.getContentUriAsync(url)
  }
  return FileSystem.getContentUriAsync(await downloadImage(url))
}

export async function clearImageCache() {
  await FileSystem.deleteAsync(imageDir)
}

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
export async function getImageLuminosity(url: string, options: Options = {}) {
  const fileUri = await downloadImage(url)
  const xStep = options.xStepCount || 5
  const yStep = options.yStepCount || 5
  const greyscaleDistance = options.greyscaleDistance || 15
  const { width, height } = await getImageSize(fileUri)
  const tally = new PixelTally({ greyscaleDistance })

  if (Platform.OS == 'ios') {
    await GetPixelColor.init(fileUri)
  } else {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    })
    await GetPixelColor.init(base64)
  }

  let xOffset = 0
  let yOffset = 0
  let xRange = width
  let yRange = height
  if (options.start && options.end) {
    xOffset = (Math.min(options.start[0], options.end[0]) / 100) * width
    yOffset = (Math.min(options.start[1], options.end[1]) / 100) * height
    xRange = (Math.abs(options.start[0] - options.end[0]) / 100) * width
    yRange = (Math.abs(options.start[1] - options.end[1]) / 100) * height
  }
  const xInterval = xRange / 10
  const yInterval = yRange / 10
  for (let i = 0; i < xStep; i += 1) {
    const x = xOffset + Math.round(i * xInterval)
    for (let j = 0; j < yStep; j += 1) {
      const y = yOffset + Math.round(j * yInterval)
      const hex = await GetPixelColor.pickColorAt(x, y)
      const color = new Color(hex)
      tally.record({
        red: color.red(),
        blue: color.blue(),
        green: color.green(),
      })
    }
  }
  return tally.getLuminosityAverage()
}
