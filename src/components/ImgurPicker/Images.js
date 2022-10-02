import { useImgurService } from '@/containers/ImgurService'
import ImagesGrid from './ImagesGrid'

export default function Images(props) {
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
