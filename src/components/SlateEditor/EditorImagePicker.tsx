import ImgurPicker, { ImgurPickerProps } from '../ImgurPicker'
import { SlateEditorService } from './types'

type Props = ImgurPickerProps & {
  editor: SlateEditorService
}
export default function EditorImagePicker(props: Props) {
  const { editor } = props
  return (
    <ImgurPicker
      {...props}
      maxCount={1}
      onSubmit={(data) => {
        const image = data[0]
        editor.insertImage({
          url: image.link,
          width: image.width,
          height: image.height,
        })
        if (props.onSubmit) {
          props.onSubmit(data)
        }
      }}
    />
  )
}
