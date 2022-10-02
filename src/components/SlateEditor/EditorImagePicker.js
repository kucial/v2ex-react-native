import ImgurPicker from '../ImgurPicker'

export default function EditorImagePicker(props) {
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
          height: image.height
        })
        if (props.onSubmit) {
          props.onSubmit()
        }
      }}
    />
  )
}
