import { View, Pressable, Text, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PhotoIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'
import useSWR from 'swr'
import { encode, decode } from 'js-base64'

import { Base64Icon } from '@/components/SlateEditor/EditorIcons'
import ImgurPicker from '@/components/ImgurPicker'
import SlideUp from '@/components/SlideUp'

// NEXT: reply cache.
export default function TopicReplyForm(props) {
  const { context } = props
  const [contentHeight, setContentHeight] = useState(60)
  const [imagePickerOpened, showImagePicker] = useState(false)
  // Use SWR as cache.
  const cacheSwr = useSWR(props.cacheKey, () => Promise.resolve(), {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0
  })

  const inputSelection = useRef()
  const { handleSubmit, control, getValues, setValue, watch } = useForm({
    defaultValues: cacheSwr.data || {
      content: context.target ? `@${context.target.member.username} ` : ''
    }
    // defaultValues: cacheSwr.data
  })

  useEffect(() => {
    return () => {
      const values = getValues()
      cacheSwr.mutate(values)
    }
  }, [])

  return (
    <View className="px-3 pt-4 bg-white w-full">
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { isTouched, error }
        }) => {
          return (
            <View
              className={classNames(
                'border w-full px-2 py-1 rounded-lg',
                isTouched && error ? 'border-red-700' : 'border-gray-400 '
              )}>
              <TextInput
                className=" w-full"
                style={{ height: contentHeight }}
                autoFocus
                onChangeText={(val) => {
                  onChange(val)
                }}
                onBlur={onBlur}
                multiline
                value={value}
                selectionColor={'#333'}
                onContentSizeChange={(e) =>
                  setContentHeight(
                    Math.max(e.nativeEvent.contentSize.height, 60)
                  )
                }
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
            className="w-[40px] h-[40px] items-center justify-center rounded-full active:bg-gray-200 active:opacity-60"
            onPress={() => {
              showImagePicker(true)
            }}>
            <PhotoIcon size={22} color="#333" />
          </Pressable>
          <Pressable
            className="w-[40px] h-[40px] items-center justify-center rounded-full active:bg-gray-200 active:opacity-60"
            onPress={() => {
              const selection = inputSelection.current
              if (selection) {
                const text = getValues('content')
                const selectedText = text.slice(selection.start, selection.end)
                const textToReplace = encode(selectedText)
                const replaced = [
                  text.slice(0, selection.start),
                  textToReplace,
                  text.slice(selection.end)
                ].join('')
                setValue('content', replaced)
              }
            }}>
            <Base64Icon size={22} color="#333" />
          </Pressable>
        </View>

        <View className="pr-1">
          <Pressable
            className={classNames(
              'h-[40px] min-w-[80px] items-center justify-center bg-gray-900 px-3 rounded-md active:opacity-60'
            )}
            onPress={(e) => {
              Keyboard.dismiss()
              handleSubmit(props.onSubmit)(e)
            }}>
            <Text className="text-white">提交</Text>
          </Pressable>
        </View>
        {imagePickerOpened && (
          <SlideUp
            visible={imagePickerOpened}
            onRequestClose={() => {
              showImagePicker(false)
            }}
            fullHeight>
            <ImgurPicker
              onSubmit={(images) => {
                const content = getValues('content')
                setValue(
                  'content',
                  [content, images.map((i) => i.link)]
                    .flat()
                    .filter(Boolean)
                    .join('\n') + '\n'
                )
                showImagePicker(false)
              }}
            />
          </SlideUp>
        )}
      </View>
    </View>
  )
}
