import { useImgurService } from '@/containers/ImgurService'

import ImagesGrid, { ImagesGridProps } from './ImagesGrid'

export default function Images(props: Omit<ImagesGridProps, 'imagesSwr'>) {
  const imgur = useImgurService()
  const imagesSwr = imgur.useImages()

  return (
    <ImagesGrid
      imagesSwr={imagesSwr}
      selected={props.selected}
      onToggleSelect={props.onToggleSelect}
    />
  )
}
