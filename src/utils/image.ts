import * as FileSystem from 'expo-file-system'

const imageDir = FileSystem.cacheDirectory + '.image_cache/'

function getImgXtension(uri: string, fallback: string) {
  const basename = uri.split(/[\\/]/).pop()
  if (!basename) {
    return fallback
  }
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : fallback
}

const getImagePath = (link: string) => {
  const url = new URL(link)
  const ext = getImgXtension(link, 'png')

  const path = [
    url.hostname.replace(/\./g, '_'),
    [
      url.pathname
        .replace(/\//g, '_')
        .replace(/%20/g, '_')
        .replace(new RegExp(`${ext}$`), ''),
      url.search.replace('?', '--'),
      ext,
    ].join(''),
  ].join('_')

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
  const fileUri = getImagePath(url)
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
