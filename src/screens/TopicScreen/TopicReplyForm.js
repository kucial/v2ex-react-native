import { View, Pressable, Text, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PhotoIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'
import useSWR from 'swr'

// NEXT: reply cache.
export default function TopicReplyForm(props) {
  const { context } = props
  const [contentHeight, setContentHeight] = useState(60)
  // Use SWR as cache.
  const cacheSwr = useSWR(props.cacheKey, () => Promise.resolve(), {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0
  })

  const { handleSubmit, control, getValues } = useForm({
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
              />
            </View>
          )
        }}
        name="content"
        rules={{ required: true }}
      />
      <View className="h-[48px] flex flex-row items-center">
        <View className="flex-1">
          <Pressable className="w-[40px] h-[40px] items-center justify-center rounded-full active:bg-gray-200 active:opacity-60">
            <PhotoIcon size={22} color="#333" />
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
      </View>
    </View>
  )
}
