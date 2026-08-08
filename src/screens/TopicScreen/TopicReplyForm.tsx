import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { encode } from 'js-base64'

import V2exIcon from '@/components/icons/V2exIcon'
import ImgurPicker from '@/components/ImgurPicker'
import { Base64Icon } from '@/components/SlateEditor/EditorIcons'

import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'
import { TopicReply } from '@/utils/v2ex-client/types'

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

  const inputRef = useRef<TextInput>(null)

  const [cache, setCache] = useCachedState<ReplyCache>(
    props.cacheKey,
    undefined,
    (cache) => {
      const prefix = context.target
        ? `@${context.target.member.username} #${context.target.num} `
        : ''
      if (cache) {
        if (prefix && !cache.content.includes(prefix)) {
          return {
            content: [cache.content, prefix].filter(Boolean).join('\n'),
          }
        }

        return cache
      }
      return {
        content: prefix,
      }
    },
  )

  const pickerRef = useRef<TrueSheet>(null)
  const inputSelection = useRef<TextSelection>(null)
  const { handleSubmit, control, getValues, setValue, watch } =
    useForm<ReplyCache>({
      defaultValues: cache,
    })

  useEffect(() => {
    const subscription = watch((values) => {
      setCache(
        {
          content: values.content || '',
        },
        true,
      )
    })
    return () => subscription.unsubscribe()
  }, [watch, setCache])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const iconColor = theme.colors.text

  return (
    <View style={replyFormStyles.container}>
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { isTouched, error },
        }) => {
          return (
            <View
              style={[
                replyFormStyles.inputWrap,
                styles.border,
                styles.overlay_input__bg,
                isTouched &&
                  error && {
                    borderColor: theme.colors.danger,
                  },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[
                  replyFormStyles.input,
                  {
                    color: theme.colors.text,
                  },
                  isTouched &&
                    error && {
                      backgroundColor: theme.colors.danger + '26',
                    },
                ]}
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
        name='content'
        rules={{ required: true }}
      />
      <View style={replyFormStyles.toolbar}>
        <View style={replyFormStyles.leftTools}>
          <Pressable
            style={({ pressed }) => [
              replyFormStyles.iconBtn,
              pressed && replyFormStyles.pressed60,
            ]}
            onPress={() => {
              showImagePicker(true)
              Keyboard.dismiss()
              presentSheet(pickerRef.current)
            }}
          >
            <V2exIcon name='photo-outline' size={22} color={iconColor} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              replyFormStyles.iconBtn,
              pressed && replyFormStyles.pressed60,
            ]}
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
            }}
          >
            <Base64Icon size={22} color={iconColor} />
          </Pressable>
        </View>

        <View style={replyFormStyles.pr1}>
          <Pressable
            style={({ pressed }) => [
              replyFormStyles.submitBtn,
              styles.btn_primary__bg,
              pressed && replyFormStyles.pressed60,
            ]}
            onPress={(e) => {
              Keyboard.dismiss()
              handleSubmit(props.onSubmit)(e)
            }}
          >
            <Text style={styles.btn_primary__text}>
              {context.type === 'reply' ? '回复' : '附言'}
            </Text>
          </Pressable>
        </View>
        <TrueSheet
          ref={pickerRef}
          detents={[0.5]}
          onDidDismiss={() => {
            showImagePicker(false)
          }}
          backgroundColor={styles.overlay.backgroundColor}
        >
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
                dismissSheet(pickerRef.current)
              }}
            />
          )}
        </TrueSheet>
      </View>
    </View>
  )
}

const replyFormStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    height: 180,
  },
  inputWrap: {
    flex: 1,
    width: '100%',
    borderRadius:
      Platform.OS === 'ios' && Number(Platform.Version) >= 26 ? 26 : 8,
  },
  input: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'android' ? 8 : 8,
    verticalAlign: Platform.OS === 'android' ? 'top' : undefined,
  },
  toolbar: {
    height: 48,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftTools: {
    flex: 1,
    flexDirection: 'row',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  pressed60: {
    opacity: 0.6,
  },
  pr1: {
    paddingRight: 4,
  },
  submitBtn: {
    height: 40,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
})
