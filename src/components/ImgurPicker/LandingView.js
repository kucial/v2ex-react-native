import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

import Albums from './Albums'
import Images from './Images'
import BackButton from '../BackButton'
import UploadButton from './UploadButton'

export default function Landing(props) {
  const [tabIndex, setTabIndex] = useState(0)
  const { colorScheme } = useColorScheme()

  return (
    <View className="flex flex-1">
      <SafeAreaView>
        <View className="border-b border-neutral-300 dark:border-neutral-600 pt-1">
          <View className="flex flex-row items-center min-h-[44px] px-1">
            <View className="w-[56px]">
              {props.onCancel && (
                <BackButton
                  tintColor={
                    colorScheme === 'dark'
                      ? colors.neutral[300]
                      : colors.neutral[800]
                  }
                  onPress={props.onCancel}
                />
              )}
            </View>
            <View className="flex-1 px-1">
              <Text
                className="text-center font-medium text-base dark:text-neutral-300"
                numberOfLines={1}
                ellipsizeMode="tail">
                Imgur 图床
              </Text>
            </View>
            <View className="w-[56px] items-end">
              {tabIndex === 0 && (
                <UploadButton
                  tintColor={
                    colorScheme === 'dark'
                      ? colors.neutral[300]
                      : colors.neutral[800]
                  }
                />
              )}
              {/* {!!props.selected.length && (
                <Pressable
                  className="h-[44px] items-center justify-center px-1 rounded-full active:bg-neutral-100"
                  onPress={props.onSubmit}>
                  <Text className="text-neutral-900 font-medium text-base text-tracking-whider">
                    选择
                  </Text>
                </Pressable>
              )} */}
            </View>
          </View>
          <View className="px-4 pt-1 pb-3 relative">
            <SegmentedControl
              values={['图片', '相册']}
              selectedIndex={tabIndex}
              onChange={(event) => {
                setTabIndex(event.nativeEvent.selectedSegmentIndex)
              }}
            />
          </View>
        </View>
      </SafeAreaView>
      {tabIndex === 1 && <Albums onSelectAlbum={props.onSelectAlbum} />}
      {tabIndex == 0 && (
        <Images
          selected={props.selected}
          onToggleSelect={props.onToggleSelect}
        />
      )}
    </View>
  )
}
