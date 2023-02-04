import { SWRResponse } from 'swr'

export type ImgurCredentials = {
  access_token: string
  account_id: string
  account_username: string
  client_id: string
  expires_in: string
  refresh_token: string
  token_type: string
}

export type ImgurImage = {
  id: string
  title: string
  description: string
  datetime: number
  type: string
  animated: boolean
  width: number
  height: number
  size: number
  views: number
  bandwidth: number
  deletehash: string
  link: string
  gifv: string
  mp4: string
  mp4_size: number
  looping: boolean
  vote: string
  favorite: boolean
  nfsw: boolean
  name?: string
}

export type ImgurAlbum = {
  id: string
  title: string
  description?: null
  datetime: number
  cover: string // image_id
  cover_edited?: boolean
  cover_width?: number
  cover_height?: number
  account_url: string
  account_id: number
  privacy: string
  layout: string
  views: number
  link: string
  favorite: boolean
  nsfw: any
  section: nay
  images_count: number
  in_gallery: boolean
  is_ad: boolan
  include_album_ads: boolean
  is_album: boolean
  deletehash: string
  order: number
}

export type ImgurImageThumbSize = 's' | 'b' | 't' | 'm' | 'l' | 'h'

export type ImgurResponse<T> = {
  status: number
  success: boolean
  data: T
}

export type ImgurUploadImagePayload = {
  image: {
    uri: string
    name: string
    type: string
  }
  name: string
  type: string
  album?: string
}

export type ImgurCreateAlbumPayload = {
  title: string
}

export interface ImgurService {
  credentials: ImgurCredentials
  updateCredentials: (data?: ImgurCredentials) => void
  useAlbums: () => SWRResponse<ImgurAlbum[], Error>
  useImages: () => SWRResponse<ImgurImage[], Error>
  useImage: (hashid: string) => SWRResponse<ImgurImage, Error>
  useAlbumImages: (album: string) => SWRResponse<ImgurImage[], Error>
  createAlbum: (data: ImgurCreateAlbumPayload) => Promise<void>
  uploadImage: (data: ImgurUploadImagePayload) => Promise<ImgurUploadResponse>
  refreshImages: () => void
  refreshAlbumImages: (album: string) => void
}
