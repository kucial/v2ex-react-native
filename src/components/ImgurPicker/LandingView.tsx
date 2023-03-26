import { useState } from 'react'
import { SafeAreaView, Text, View } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'

import { ImgurAlbum, ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import BackButton from '../BackButton'
import Albums from './Albums'
import Images from './Images'
import UploadButton from './UploadButton'

type LandingProps = {
  selected: ImgurImage[]
  tabIndex: number
  setTabIndex(index: number): void
  onCancel(): void
  onSelectAlbum(album: ImgurAlbum): void
  onToggleSelect(image: ImgurImage): void
}
export default function Landing(props: LandingProps) {
  const { tabIndex } = props
  const { theme, styles, colorScheme } = useTheme()

  return (
    <View className="flex flex-1">
      <SafeAreaView>
        <View className="pt-1" style={styles.border_b}>
          <View className="flex flex-row items-center min-h-[44px] px-1">
            <View className="w-[56px]">
              {props.onCancel && (
                <BackButton
                  tintColor={theme.colors.text}
                  onPress={props.onCancel}
                />
              )}
            </View>
            <View className="flex-1 px-1">
              <Text
                className="text-center font-medium text-base"
                style={styles.text}
                numberOfLines={1}
                ellipsizeMode="tail">
                Imgur 图床
              </Text>
            </View>
            <View className="w-[56px] items-end">
              {tabIndex === 0 && <UploadButton tintColor={theme.colors.text} />}
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
                props.setTabIndex(event.nativeEvent.selectedSegmentIndex)
              }}
              appearance={colorScheme}
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
