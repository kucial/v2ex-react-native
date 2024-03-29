import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native'
import { Platform } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/outline'
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import classNames from 'classnames'
import { encode } from 'js-base64'
import colors from 'tailwindcss/colors'

import ImgurPicker from '@/components/ImgurPicker'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import { Base64Icon } from '@/components/SlateEditor/EditorIcons'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'
import { TopicReply } from '@/utils/v2ex-client/types'

const pickerSnapPoints = ['90%']

type TextSelection = {
  start: number
  end: number
}

type TopicReplyFormProps = {
  cacheKey: string
  context: {
    type: 'reply' | 'append'
    target?: TopicReply
  }
  onSubmit: (values: { content: string }) => Promise<void>
  onInitImgurSettings: () => void
}

type ReplyCache = {
  content: string
}
// NEXT: reply cache.
export default function TopicReplyForm(props: TopicReplyFormProps) {
  const { context } = props
  const { theme, styles } = useTheme()
  const [imagePickerOpened, showImagePicker] = useState(false)

  const Input = Platform.OS === 'android' ? TextInput : BottomSheetTextInput
  // Use SWR as cache.

  const [cache, setCache] = useCachedState<ReplyCache>(
    props.cacheKey,
    undefined,
    (cache) => {
      if (cache) {
        return cache
      }
      return {
        content: context.target
          ? `@${context.target.member.username} #${context.target.num} `
          : '',
      }
    },
  )

  const pickerRef = useRef<BottomSheetModal>()
  const inputSelection = useRef<TextSelection>()
  const { handleSubmit, control, getValues, setValue } = useForm({
    defaultValues: cache,
  })

  useEffect(() => {
    return () => {
      const values = getValues()
      setCache(values, true)
    }
  }, [])

  const iconColor = theme.colors.text

  return (
    <View className="px-3 flex flex-col flex-1">
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { isTouched, error },
        }) => {
          return (
            <View
              className={classNames('flex-1 w-full rounded-lg')}
              style={[
                styles.border,
                styles.overlay_input__bg,
                isTouched &&
                  error && {
                    borderColor: theme.colors.danger,
                  },
              ]}>
              <Input
                autoFocus
                style={[
                  {
                    width: '100%',
                    height: Platform.OS === 'android' ? 200 : '100%',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: Platform.OS === 'android' ? 8 : 1,
                    color: theme.colors.text,
                    verticalAlign:
                      Platform.OS === 'android' ? 'top' : undefined,
                  },
                  isTouched &&
                    error && {
                      backgroundColor: colors.red[500] + '26',
                    },
                ]}
                selectionColor={theme.colors.primary}
                onChangeText={(val) => {
                  onChange(val)
                }}
                onBlur={onBlur}
                multiline
                value={value}
                onSelectionChange={(e) => {
                  const { selection } = e.nativeEvent
                  inputSelection.current = selection
                }}
              />
            </View>
          )
        }}
        name="content"
        rules={{ required: true }}
      />
      <View className="h-[48px] flex flex-row items-center">
        <View className="flex-1 flex flex-row">
          <Pressable
            className="w-[40px] h-[40px] items-center justify-center rounded-full active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600"
            onPress={() => {
              showImagePicker(true)
              Keyboard.dismiss()
              pickerRef.current?.present()
            }}>
            <PhotoIcon size={22} color={iconColor} />
          </Pressable>
          <Pressable
            className="w-[40px] h-[40px] items-center justify-center rounded-full active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600"
            onPress={() => {
              const selection = inputSelection.current
              if (selection) {
                const text = getValues('content')
                const selectedText = text.slice(selection.start, selection.end)
                const textToReplace = encode(selectedText)
                const replaced = [
                  text.slice(0, selection.start),
                  textToReplace,
                  text.slice(selection.end),
                ].join('')
                setValue('content', replaced)
              }
            }}>
            <Base64Icon size={22} color={iconColor} />
          </Pressable>
        </View>

        <View className="pr-1">
          <Pressable
            className={classNames(
              'h-[40px] min-w-[80px] items-center justify-center px-3 rounded-md',
              'active:opacity-60',
            )}
            style={styles.btn_primary__bg}
            onPress={(e) => {
              Keyboard.dismiss()
              handleSubmit(props.onSubmit)(e)
            }}>
            <Text style={styles.btn_primary__text}>
              {context.type === 'reply' ? '回复' : '附言'}
            </Text>
          </Pressable>
        </View>
        <MyBottomSheetModal
          ref={pickerRef}
          index={0}
          snapPoints={pickerSnapPoints}
          onDismiss={() => {
            showImagePicker(false)
          }}>
          {imagePickerOpened && (
            <ImgurPicker
              onConfigSettings={() => {
                props.onInitImgurSettings()
              }}
              onSubmit={(images) => {
                const content = getValues('content')
                setValue(
                  'content',
                  [content, images.map((i) => i.link)]
                    .flat()
                    .filter(Boolean)
                    .join('\n') + '\n',
                )
                pickerRef.current.dismiss()
              }}
            />
          )}
        </MyBottomSheetModal>
      </View>
    </View>
  )
}
