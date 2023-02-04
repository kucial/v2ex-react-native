import axios, { AxiosInstance } from 'axios'

const IMGUR_API_PREFIX = 'https://api.imgur.com'

import {
  ImgurAlbum,
  ImgurCreateAlbumPayload,
  ImgurCredentials,
  ImgurImage,
  ImgurResponse,
  ImgurUploadImagePayload,
} from './types'

export class ImgurClient {
  fetcher: AxiosInstance
  credentials?: ImgurCredentials

  constructor(credentials?: ImgurCredentials) {
    this.fetcher = axios.create({
      baseURL: IMGUR_API_PREFIX,
      responseType: 'json',
    })
    this.credentials = credentials
    this.fetcher.interceptors.request.use((config) => {
      console.log('imgur fetch....', config.url)
      config.headers = config.headers ? config.headers : {}
      if (this.credentials?.access_token) {
        config.headers.authorization = `Bearer ${this.credentials.access_token}`
      }
      return config
    })

    this.fetcher.interceptors.response.use(
      function (res) {
        console.log('IMGUR_RESPONSE_HEADERS', res.headers)
        console.log(res.data)
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
      },
    )
  }
  getAlbums(username = 'me', page?: number) {
    return this.fetcher.request<never, ImgurResponse<ImgurAlbum[]>>({
      url: `/3/account/${username}/albums/${page || ''}`,
    })
  }
  getImages(username = 'me', page = 0) {
    return this.fetcher.request<never, ImgurResponse<ImgurImage[]>>({
      url: `/3/account/${username}/images/${page}`,
    })
  }

  getImage(hashid: string) {
    return this.fetcher.request<never, ImgurResponse<ImgurImage>>({
      url: `/3/image/${hashid}`,
    })
  }

  async upload(payload: ImgurUploadImagePayload) {
    const formData = new FormData()
    formData.append('image', payload.image)
    formData.append('name', payload.name)
    formData.append('type', payload.type)
    if (payload.album) {
      formData.append('album', payload.album)
    }
    return this.fetcher.request<never, ImgurResponse<ImgurImage>>({
      url: `/3/upload`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => {
        return data
      },
    })
  }
  getAlbumImages(album: string) {
    return this.fetcher.request<never, ImgurResponse<ImgurImage[]>>({
      url: `/3/album/${album}/images`,
    })
  }
  createAlbum(data: ImgurCreateAlbumPayload) {
    return this.fetcher.request<never, ImgurResponse<ImgurAlbum>>({
      url: '/3/album',
      method: 'POST',
      data,
    })
  }
  setCredentials(credentials: ImgurCredentials) {
    this.credentials = credentials
  }
}

const client = new ImgurClient()

export default client
