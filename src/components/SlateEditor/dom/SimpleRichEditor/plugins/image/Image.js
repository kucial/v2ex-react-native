import { Transforms } from 'slate'
import {
  ReactEditor,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react'

const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div contentEditable={false} className='slate-image-frame'>
        <img
          src={element.data.url}
          width={element.data.width}
          height={element.data.height}
          className={`slate-image ${selected && focused ? 'slate-image-selected' : ''}`}
        />
        <button
          aria-label='Delete image'
          className={`slate-image-delete ${
            selected && focused ? '' : 'slate-image-delete-hidden'
          }`}
          onMouseDown={(e) => {
            e.preventDefault()
          }}
          onMouseUp={(e) => {
            e.preventDefault()
          }}
          onClick={() => Transforms.removeNodes(editor, { at: path })}
        >
          <svg
            aria-hidden='true'
            fill='none'
            height='20'
            viewBox='0 0 24 24'
            width='20'
          >
            <path
              d='M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Image
