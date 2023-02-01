import { useContext, useMemo, useState } from 'react'
import { createContext } from 'react'
import useSWR, { useSWRConfig } from 'swr'

import {
  ImgurCredentials,
  ImgurImage,
  ImgurImageThumbSize,
  ImgurService,
} from './types'

export const ImgurServiceContext = createContext<ImgurService>(
  {} as ImgurService,
)

export const useImgurService = () => useContext(ImgurServiceContext)

const SERVICE_KEY = '$app$/services/imgur'

import { useCachedState } from '@/utils/hooks'

import client from './ImgurClient'

export default function ImgurServiceProvider(props) {
  const [credentials, setCredentials] = useCachedState<
    ImgurCredentials | undefined
  >(SERVICE_KEY, undefined)
  const { mutate } = useSWRConfig()

  const service: ImgurService = useMemo(() => {
    client.setCredentials(credentials)
    return {
      updateCredentials: (config: ImgurCredentials) => {
        setCredentials(config)
      },
      credentials,
      useAlbums() {
        return useSWR(
          credentials ? `/imgur/albums` : null,
          async () => {
            const res = await client.getAlbums('me')
            return res.data
          },
          {
            revalidateIfStale: false,
          },
        )
      },
      useImages() {
        return useSWR(
          `/imgur/images`,
          async () => {
            const res = await client.getImages()
            return res.data
          },
          {
            revalidateIfStale: false,
          },
        )
      },
      useImage(hashid: string) {
        return useSWR(
          hashid ? `/imgur/image/${hashid}` : null,
          async () => {
            const res = await client.getImage(hashid)
            return res.data
          },
          {
            revalidateIfStale: false,
          },
        )
      },
      useAlbumImages(album) {
        return useSWR(
          `/imgur/album/${album}/images`,
          async () => {
            const res = await client.getAlbumImages(album)
            return res.data
          },
          {
            revalidateIfStale: false,
          },
        )
      },
      getAlbums() {
        return client.getAlbums()
      },
      async createAlbum(data) {
        await client.createAlbum(data)
        mutate(`/imgur/albums`)
      },
      async uploadImage(payload) {
        const res = await client.upload(payload)
        if (payload.album) {
          mutate(`/imgur/album/${payload.album}/images`)
        } else {
          mutate(`/imgur/images`)
        }
        return res.data
      },
      refreshImages() {
        mutate('/imgur/images')
      },
      refreshAlbumImages(album) {
        mutate(`/imgur/album/${album}/images`)
      },
    }
  }, [credentials])
  return (
    <ImgurServiceContext.Provider value={service}>
      {props.children}
    </ImgurServiceContext.Provider>
  )
}

export const getImageLink = (image: ImgurImage, size?: ImgurImageThumbSize) => {
  if (!size) {
    return image.link
  }
  return image.link.replace(/\.(\w*)$/, `${size}.$1`)
}
