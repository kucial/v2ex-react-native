
import {
  useSlateStatic,
  useSelected,
  useFocused,
  ReactEditor,
} from 'slate-react'
import { Transforms } from 'slate'
import { BsTrash } from 'react-icons/bs'

const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className='relative p-[2px]'
      >
        <img
          src={element.data.url}
          width={element.data.width}
          height={element.data.height}
          className={`block max-w-full h-auto mx-auto ${selected && focused ? 'outline-2 outline outline-neutral-800' : ''}`}
        />
        <button
          className={`btn w-[44px] h-[44px] absolute top-2 right-2 rounded-lg bg-white/50 text-red-600 dark:bg-neutral-800/50 dark:text-rose-400 ${ selected && focused ? 'flex': '!hidden'}`}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
          }}
          onClick={() => Transforms.removeNodes(editor, { at: path })}
        >
          <BsTrash size={20} />
        </button>
      </div>
    </div>
  )
}

export default Image