import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import Albums from './Albums'
import Images from './Images'
import BackButton from '../BackButton'
import UploadButton from './UploadButton'

export default function Landing(props) {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <View className="flex flex-1">
      <SafeAreaView>
        <View className="border-b border-gray-300 pt-1">
          <View className="flex flex-row items-center min-h-[44px] px-1">
            <View className="w-[56px]">
              {props.onCancel && <BackButton onPress={props.onCancel} />}
            </View>
            <View className="flex-1 px-1">
              <Text
                className="text-center font-medium text-base"
                numberOfLines={1}
                ellipsizeMode="tail">
                Imgur 图床
              </Text>
            </View>
            <View className="w-[56px] items-end">
              {tabIndex === 0 && <UploadButton />}
              {/* {!!props.selected.length && (
                <Pressable
                  className="h-[44px] items-center justify-center px-1 rounded-full active:bg-gray-100"
                  onPress={props.onSubmit}>
                  <Text className="text-gray-900 font-medium text-base text-tracking-whider">
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
          onToggleSelect={props.onToggleImage}
        />
      )}
    </View>
  )
}