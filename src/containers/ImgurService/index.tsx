import { createContext, useContext, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useCachedState } from '@/utils/hooks'

import client from './ImgurClient'
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

export default function ImgurServiceProvider(props) {
  const [credentials, setCredentials] = useCachedState<
    ImgurCredentials | undefined
  >(SERVICE_KEY, undefined)
  const queryClient = useQueryClient()

  const service: ImgurService = useMemo(() => {
    client.setCredentials(credentials)
    return {
      updateCredentials: (config: ImgurCredentials) => {
        setCredentials(config)
      },
      credentials,
      useAlbums() {
        return useQuery({
          queryKey: ['/imgur/albums'],
          queryFn: async () => {
            const res = await client.getAlbums('me')
            return res.data
          },
          enabled: !!credentials,
        })
      },
      useImages() {
        return useQuery({
          queryKey: [`/imgur/images`],
          queryFn: async () => {
            const res = await client.getImages()
            return res.data
          },
        })
      },
      useImage(hashid: string) {
        return useQuery({
          queryKey: [`/imgur/image/:hashid`, hashid],
          queryFn: async () => {
            const res = await client.getImage(hashid)
            return res.data
          },
        })
      },
      useAlbumImages(album) {
        return useQuery({
          queryKey: [`/imgur/album/:id/images`, album],
          queryFn: async () => {
            const res = await client.getAlbumImages(album)
            return res.data
          },
        })
      },
      async createAlbum(data) {
        await client.createAlbum(data)
        queryClient.invalidateQueries({
          queryKey: ['/imgur/albums'],
          exact: true,
          refetchType: 'active',
        })
      },

      async uploadImage(payload) {
        const res = await client.upload(payload)
        const image = res.data
        if (payload.album) {
          await client.addAlbumImages(payload.album, [image.deletehash])
        }

        if (payload.album) {
          queryClient.invalidateQueries({
            queryKey: ['/imgur/album/:id/images', payload.album],
            exact: true,
            refetchType: 'active',
          })
        }
        queryClient.invalidateQueries({
          queryKey: ['/imgur/images'],
          exact: true,
          refetchType: 'active',
        })
        return image
      },

      async deleteImage(payload: { imageHash: string; albumHash?: string }) {
        await client.deleteImage(payload.imageHash)
        if (payload.albumHash) {
          queryClient.invalidateQueries({
            queryKey: ['/imgur/album/:id/images', payload.albumHash],
            exact: true,
            refetchType: 'active',
          })
        } else {
          queryClient.invalidateQueries({
            queryKey: ['/imgur/images'],
            exact: true,
            refetchType: 'active',
          })
        }
      },
      refreshImages() {
        queryClient.invalidateQueries({
          queryKey: ['/imgur/images'],
          exact: true,
          refetchType: 'active',
        })
      },
      refreshAlbumImages(album) {
        queryClient.invalidateQueries({
          queryKey: ['/imgur/album/:id/images', album],
          exact: true,
          refetchType: 'active',
        })
      },
      async renameAlbum(albumHashId: string, newTitle: string) {
        await client.updateAlbum(albumHashId, {
          title: newTitle,
        })
        queryClient.invalidateQueries({
          queryKey: ['/imgur/albums'],
          exact: true,
          refetchType: 'active',
        })
      },
      async deleteAlbum(albumHashId: string) {
        await client.deleteAlbum(albumHashId)
        queryClient.invalidateQueries({
          queryKey: ['/imgur/albums'],
          exact: true,
          refetchType: 'active',
        })
        queryClient.invalidateQueries({
          queryKey: ['/imgur/album/:id/images', albumHashId],
          exact: true,
          refetchType: 'none',
        })
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
