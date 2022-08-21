import { useContext, useMemo, useState } from 'react'
import { createContext } from 'react'
import axios from 'axios'

import { getJSON, setJSON } from '@/utils/storage'
import { useSWR } from '@/utils/swr'
import { useSWRConfig } from 'swr'

export const ImgurServiceContext = createContext()

export const useImgurService = () => useContext(ImgurServiceContext)

const SERVICE_KEY = '$app$/services/imgur'

const IMGUR_API_PREFIX = 'https://api.imgur.com'

class ImgurClient {
  constructor(credentials = {}) {
    this.fetcher = axios.create({
      baseURL: IMGUR_API_PREFIX,
      responseType: 'json'
    })
    this.credentials = credentials

    this.fetcher.interceptors.request.use((config) => {
      config.headers = config.headers ? config.headers : {}
      if (this.credentials?.access_token) {
        config.headers.authorization = `Bearer ${this.credentials.access_token}`
      }
      console.log('IMGUR_REQUEST', config)
      return config
    })

    this.fetcher.interceptors.response.use(
      function (res) {
        console.log('IMGUR_RESPONSE_HEADERS', res.headers)
        if (res.status < 400) {
          return res.data
        }
        return res
      },
      function (err) {
        if (err.response?.data) {
          console.log(err.response.data)
        }
        return Promise.reject(err)
      }
    )
  }
  getAlbums(username = 'me', page) {
    return this.fetcher({
      url: `/3/account/${username}/albums/${page || ''}`
    })
  }
  getImages(username = 'me', page = 0) {
    return this.fetcher({
      url: `/3/account/${username}/images/${page}`
    })
  }
  getImage(hashid) {
    return this.fetcher({
      url: `/3/image/${hashid}`
    })
  }
  async upload(payload) {
    const formData = new FormData()
    formData.append('image', payload.image)
    formData.append('name', payload.name)
    formData.append('type', payload.type)
    if (payload.album) {
      formData.append('album', payload.album)
    }
    return this.fetcher({
      url: `/3/upload`,
      method: 'POST',
      data: formData,
      transformRequest: (data) => {
        return data
      }
    })
  }
  getAlbumImages(album) {
    return this.fetcher({
      url: `/3/album/${album}/images`
    })
  }
  createAlbumn(data) {
    return this.fetcher({
      url: '`/3/album',
      method: 'POST',
      data
    })
  }
  setCredentials(credentials) {
    this.credentials = credentials
  }
}

const client = new ImgurClient()

export default function ImgurService(props) {
  const [credentials, setCredentials] = useState(getJSON(SERVICE_KEY))
  const { mutate } = useSWRConfig()

  const service = useMemo(() => {
    client.setCredentials(credentials)
    return {
      updateCredentials: (config) => {
        setCredentials(config)
        setJSON(SERVICE_KEY, config)
      },
      credentials,
      useAlbums() {
        return useSWR(credentials ? `/imgur/albums` : null, async () => {
          const res = await client.getAlbums('me')
          return res.data
        })
      },
      useImages(page = 0) {
        return useSWR(`/imgur/accounts/me/images/${page}`, async () => {
          const res = await client.getImages()
          return res.data
        })
      },
      useImage(hashid) {
        return useSWR(hashid ? `/imgur/image/${hashid}` : null, async () => {
          const res = await client.getImage(hashid)
          return res.data
        })
      },
      useAlbumImages(album) {
        return useSWR(`/imgur/album/${album}/images`, async () => {
          const res = await client.getAlbumImages(album)
          return res.data
        })
      },
      getAlbums() {
        return client.getAlbums()
      },
      async createAlbumn(data) {
        await client.createAlbumn(data)
        mutate(`/imgur/albums`)
      },
      upload(payload) {
        return client.upload(payload)
      },
      flushImages(album) {
        mutate(`/imgur/album/${album}/images`)
      }
    }
  }, [credentials])
  return (
    <ImgurServiceContext.Provider value={service}>
      {props.children}
    </ImgurServiceContext.Provider>
  )
}

const getValidSize = (size) => {
  if (['s', 'b', 't', 'm', 'l', 'h'].includes(size)) {
    return size
  }
}
export const getImageLink = (image, size) => {
  const validSize = getValidSize(size)
  if (!validSize) {
    return image.link
  }
  return image.link.replace(/\.(\w*)$/, `${validSize}.$1`)
}
