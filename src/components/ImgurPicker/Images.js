import { useEffect } from 'react'
import { InteractionManager } from 'react-native'

import { useImgurService } from '@/containers/ImgurService'

import ImagesGrid from './ImagesGrid'

export default function Images(props) {
  const imgur = useImgurService()
  const imagesSwr = imgur.useImages()

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (
        !imagesSwr.isValidating &&
        (!imagesSwr.data ||
          !imagesSwr.data.fetchedAt ||
          Date.now() - imagesSwr.data.fetchedAt > 1000 * 60 * 5) // 自动刷新
      ) {
        imagesSwr.mutate()
      }
    })
  }, [])

  return (
    <ImagesGrid
      imagesSwr={imagesSwr}
      selected={props.selected}
      onToggleSelect={props.onToggleSelect}
    />
  )
}
