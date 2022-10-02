import { View, Pressable, Text, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PhotoIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'
import useSWR from 'swr'
import { encode, decode } from 'js-base64'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput
} from '@gorhom/bottom-sheet'

import { Base64Icon } from '@/components/SlateEditor/EditorIcons'
import ImgurPicker from '@/components/ImgurPicker'

const pickerSnapPoints = ['90%']

const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )
}

// NEXT: reply cache.
export default function TopicReplyForm(props) {
  const { context } = props
  const [imagePickerOpened, showImagePicker] = useState(false)
  const { colorScheme } = useColorScheme()
  const tw = useTailwind()
  // Use SWR as cache.
  const cacheSwr = useSWR(props.cacheKey, () => Promise.resolve(), {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0
  })

  const pickerRef = useRef()
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

  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[900]

  return (
    <View className="px-3 flex flex-col flex-1">
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { isTouched, error }
        }) => {
          return (
            <View
              className={classNames(
                'flex-1 border w-full px-2 py-1 rounded-lg dark:bg-neutral-900',
                isTouched && error
                  ? 'border-red-700 dark:border-rose-500'
                  : 'border-neutral-400 dark:border-neutral-700'
              )}>
              <BottomSheetTextInput
                autoFocus
                style={[tw('w-full dark:text-neutral-200')]}
                selectionColor={
                  colorScheme === 'dark'
                    ? colors.amber[50]
                    : colors.neutral[900]
                }
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
                  text.slice(selection.end)
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
              'bg-neutral-900 active:opacity-60',
              'dark:bg-amber-50 dark:opacity-90 dark:active:opacity-60'
            )}
            onPress={(e) => {
              Keyboard.dismiss()
              handleSubmit(props.onSubmit)(e)
            }}>
            <Text className="text-white dark:text-neutral-900">提交</Text>
          </Pressable>
        </View>
        <BottomSheetModal
          ref={pickerRef}
          index={0}
          snapPoints={pickerSnapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={tw('bg-white dark:bg-neutral-800')}
          handleIndicatorStyle={tw('bg-neutral-300 dark:bg-neutral-400')}
          onDismiss={() => {
            showImagePicker(false)
          }}>
          {imagePickerOpened && (
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
                pickerRef.current.dismiss()
              }}
            />
          )}
        </BottomSheetModal>
      </View>
    </View>
  )
}
