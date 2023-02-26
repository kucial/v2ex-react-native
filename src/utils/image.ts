import 'react-native-url-polyfill/auto'

import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'

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
