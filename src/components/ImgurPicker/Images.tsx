import { useCallback } from 'react'

import { useImgurService } from '@/containers/ImgurService'
import { ImgurImage } from '@/containers/ImgurService/types'

import ImagesGrid, { ImagesGridProps } from './ImagesGrid'

export default function Images(
  props: Omit<ImagesGridProps, 'imagesQuery' | 'onDelete'>,
) {
  const imgur = useImgurService()
  const imagesQuery = imgur.useImages()

  const handleDelete = useCallback(async (image: ImgurImage) => {
    await imgur.deleteImage({
      imageHash: image.deletehash,
    })
  }, [])

  return (
    <ImagesGrid
      imagesQuery={imagesQuery}
      selected={props.selected}
      onToggleSelect={props.onToggleSelect}
      onDelete={handleDelete}
    />
  )
}
