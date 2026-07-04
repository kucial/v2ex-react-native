import {
  GestureResponderEvent,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

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

type ToolbarButtonProps = {
  active?: boolean
  disabled?: boolean
  Icon: (props: IconProps) => JSX.Element
  iconProps?: IconProps
  onPress?(e: GestureResponderEvent): void
}

function ToolbarButton({
  active,
  disabled,
  onPress,
  Icon,
  iconProps,
}: ToolbarButtonProps) {
  const { theme, styles } = useTheme()
  let color
  if (active) {
    color = styles.btn_primary__text.color
  } else {
    color = theme.colors.text
  }
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        toolbarStyles.button,
        disabled ? toolbarStyles.disabled : pressed && toolbarStyles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          toolbarStyles.iconWrap,
          {
            width: 34,
            height: 34,
            backgroundColor: active
              ? theme.colors.primary
              : theme.colors.bg_overlay,
          },
        ]}
      >
        <Icon size={22} color={color} {...iconProps} />
      </View>
    </Pressable>
  )
}

function Divider({ margin = true, color }) {
  return (
    <View
      style={[
        toolbarStyles.divider,
        margin && toolbarStyles.dividerMargin,
        {
          backgroundColor: color,
        },
      ]}
    ></View>
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
      sentry-label='EditorToolbar'
      style={[
        toolbarStyles.container,
        props.style,
        styles.border_t_light,
        {
          backgroundColor: theme.colors.bg_overlay,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
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

      <View style={toolbarStyles.rightActions}>
        <Divider margin={false} color={theme.colors.border} />
        <ToolbarButton
          onPress={() => {
            editor.blur()
            Keyboard.dismiss()
          }}
          Icon={KeyboardDismissIcon}
        />
      </View>
    </View>
  )
}

const toolbarStyles = StyleSheet.create({
  button: {
    width: 38,
    height: 42,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 18,
    width: 1,
  },
  dividerMargin: {
    marginHorizontal: 4,
  },
  container: {
    flexDirection: 'row',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
})
