import { Pressable, ScrollView, View } from 'react-native'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'

import { useTheme } from '@/containers/ThemeService'

import { useEditor } from './context'
import {
  Base64Icon,
  BoldIcon,
  ImageIcon,
  IndentIcon,
  ItalicIcon,
  KeyboardDismissIcon,
  OrderedListIcon,
  OutdentIcon,
  RedoIcon,
  TextQuoteIcon,
  TitleIcon,
  UnderlineIcon,
  UndoIcon,
  UnorderedListIcon,
} from './EditorIcons'

function ToolbarButton({ active, disabled, onPress, Icon, iconProps }) {
  const { theme } = useTheme()
  let color
  if (active) {
    color = theme.colors.text_primary_inverse
  } else {
    color = theme.colors.text
  }
  return (
    <Pressable
      disabled={disabled}
      className={classNames(
        'w-[42px] h-[42px] rounded-md flex items-center justify-center',
        {
          'active:opacity-60': !disabled,
          'opacity-50': disabled,
        },
      )}
      style={[
        {
          backgroundColor: active
            ? theme.colors.primary
            : theme.colors.bg_footer,
        },
      ]}
      onPress={onPress}>
      <Icon size={22} color={color} {...iconProps} />
    </Pressable>
  )
}

function Divider({ margin = true, color }) {
  return (
    <View
      className={classNames('h-[18px] w-[1px]', margin && 'mx-1')}
      style={{
        backgroundColor: color,
      }}></View>
  )
}

export default function EditorToolbar(props) {
  const editor = useEditor()
  const { theme, styles } = useTheme()

  if (props.showOnFocus && !editor.hasFocus()) {
    return null
  }
  return (
    <View
      sentry-label="EditorToolbar"
      className="flex flex-row"
      style={[
        props.style,
        styles.border_t,
        styles.border_light,
        {
          backgroundColor: theme.colors.bg_footer,
        },
      ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <ToolbarButton
          disabled={!editor.canUndo()}
          onPress={() => {
            editor.undo().catch((err) => {
              console.log(err)
            })
          }}
          Icon={UndoIcon}
        />
        <ToolbarButton
          disabled={!editor.canRedo()}
          onPress={() => {
            editor.redo()
          }}
          Icon={RedoIcon}
        />
        <Divider color={theme.colors.border} />
        <ToolbarButton
          active={editor.isMarkActive('bold')}
          onPress={() => {
            editor.toggleMark('bold')
          }}
          Icon={BoldIcon}
        />
        <ToolbarButton
          active={editor.isMarkActive('italic')}
          onPress={() => {
            editor.toggleMark('italic')
          }}
          Icon={ItalicIcon}
        />
        <ToolbarButton
          active={editor.isMarkActive('underline')}
          onPress={() => {
            editor.toggleMark('underline')
          }}
          Icon={UnderlineIcon}
        />
        <ToolbarButton
          active={false}
          onPress={() => {
            editor.base64Encode()
          }}
          Icon={Base64Icon}
        />
        <Divider color={theme.colors.border} />
        <ToolbarButton
          active={editor.isBlockActive('heading-two')}
          onPress={() => {
            editor.toggleBlock('heading-two')
          }}
          Icon={TitleIcon}
        />
        {props.onOpenImageSelect && (
          <ToolbarButton
            active={editor.isBlockActive('image')}
            onPress={() => {
              // TODO: open image select modal
              props.onOpenImageSelect()
            }}
            Icon={ImageIcon}
          />
        )}
        <ToolbarButton
          active={editor.isBlockActive('blockquote')}
          onPress={() => {
            editor.toggleBlock('blockquote')
          }}
          Icon={TextQuoteIcon}
        />
        {/* <ToolbarButton
          active={editor.isBlockActive('code-block')}
          onPress={() => {
            editor.toggleBlock('code-block')
          }}
          Icon={CodeBlockIcon}
        /> */}
        <ToolbarButton
          active={editor.isBlockActive('unordered-list')}
          onPress={() => {
            editor.toggleBlock('unordered-list')
          }}
          Icon={UnorderedListIcon}
        />
        <ToolbarButton
          active={editor.isBlockActive('ordered-list')}
          onPress={() => {
            editor.toggleBlock('ordered-list')
          }}
          Icon={OrderedListIcon}
        />
        <Divider color={theme.colors.border} />
        <ToolbarButton
          disabled={!editor.canIndent()}
          onPress={() => {
            editor.listIndent()
          }}
          Icon={IndentIcon}
        />
        <ToolbarButton
          disabled={!editor.canOutdent()}
          onPress={() => {
            editor.listOutdent()
          }}
          Icon={OutdentIcon}
        />
      </ScrollView>

      <View className="flex flex-row items-center flex-shrink-0">
        <Divider margin={false} />
        <ToolbarButton
          onPress={() => {
            editor.blur()
          }}
          Icon={KeyboardDismissIcon}
        />
      </View>
    </View>
  )
}
