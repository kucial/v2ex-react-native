import { View, ScrollView, Pressable } from 'react-native'
import React from 'react'
import classNames from 'classnames'
import { useEditor } from './context'
import {
  UndoIcon,
  RedoIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  TitleIcon,
  ImageIcon,
  UnorderedListIcon,
  OrderedListIcon,
  IndentIcon,
  OutdentIcon,
  TextQuoteIcon,
  CodeBlockIcon,
  Base64Icon,
  KeyboardDismissIcon
} from './EditorIcons'
import { useAlertService } from '@/containers/AlertService'
import { useTailwind } from 'tailwindcss-react-native'
import { useWindowDimensions } from 'react-native'

function ToolbarButton({ active, disabled, onPress, Icon, iconProps }) {
  const tw = useTailwind()
  const { color } = tw(
    active
      ? 'text-white dark:text-amber-50'
      : 'text-neutral-800 dark:text-neutral-200'
  )
  return (
    <Pressable
      disabled={disabled}
      className={classNames(
        'w-[42px] h-[42px] rounded-md bg-white dark:bg-neutral-750 flex items-center justify-center',
        {
          'bg-neutral-900 text-white dark:bg-neutral-600': active,
          'active:bg-neutral-100 active:bg-neutral-600': !active,
          'active:opacity-60': !disabled,
          'opacity-50': disabled
        }
      )}
      onPress={onPress}>
      <Icon size={22} color={color} {...iconProps} />
    </Pressable>
  )
}

function Divider() {
  return (
    <View className="h-[18px] mx-1 w-[1px] bg-neutral-300 dark:bg-neutral-600"></View>
  )
}

export default function EditorToolbar(props) {
  const editor = useEditor()
  const alert = useAlertService()
  if (props.showOnFocus && !editor.hasFocus()) {
    return null
  }
  return (
    <View
      style={[props.style]}
      className="bg-white border-t border-neutral-300 dark:bg-neutral-750 dark:border-neutral-600">
      <View className="flex flex-row">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
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
          <Divider />
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
              // TODO...
            }}
            Icon={Base64Icon}
          />
          <Divider />
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
          <Divider />
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
          <Divider />
          <ToolbarButton
            onPress={() => {
              editor.blur()
            }}
            Icon={KeyboardDismissIcon}
          />
        </View>
      </View>
    </View>
  )
}
