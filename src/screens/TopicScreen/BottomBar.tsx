import { useCallback, useRef } from 'react'
import { Pressable, SafeAreaView, Text, View } from 'react-native'
import { ShareIcon } from 'react-native-heroicons/outline'
import LottieView from 'lottie-react-native'

import HeartIcon from '@/components/HeartIcon'
import NumberIcon from '@/components/NumberIcon'
import StarIcon from '@/components/StarIcon'
import ToBottomIcon from '@/components/ToBottomIcon'
import { useTheme } from '@/containers/ThemeService'

import ScrollControl from './ScrollControl'
import { BarProps } from './types'

export default function BottomBar(props: BarProps) {
  const { styles, theme } = useTheme()

  const iconColor = theme.colors.text_meta
  const heartIconRef = useRef<LottieView>(null)
  const starIconRef = useRef<LottieView>(null)

  const handleThank = useCallback(() => {
    if (props.thanked) {
      return
    }
    heartIconRef.current?.play()
    props.onThankTopic()
  }, [props.onThankTopic, props.thanked])

  const handleToggleCollect = useCallback(() => {
    if (props.collected) {
      starIconRef.current?.reset()
    } else {
      starIconRef.current?.play()
    }
    props.onToggleCollect()
  }, [props.onToggleCollect, props.collected])

  return (
    <SafeAreaView style={[styles.overlay, styles.border_t_light]}>
      <View className="h-[48px] flex flex-row items-center pl-3 pr-1">
        <View className="flex-1 mr-2">
          <Pressable
            hitSlop={5}
            className="h-[32px] w-full justify-center px-3 rounded-full active:opacity-60"
            style={styles.overlay_input__bg}
            onPress={() => {
              props.onInitReply()
            }}>
            <Text className="text-sm" style={styles.text_placeholder}>
              发表评论
            </Text>
          </Pressable>
        </View>
        <ScrollControl
          ref={props.scrollControlRef}
          max={props.repliesCount}
          onNavTo={props.onNavTo}
          renderButton={({ action, onPress, disabled }) => (
            <Pressable
              className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600 disabled:opacity-50"
              disabled={disabled}
              onPress={onPress}>
              <View className="my-1">
                {action ? (
                  <View
                    style={
                      action === 'to_top' && {
                        transform: [{ rotate: '180deg' }],
                      }
                    }>
                    <ToBottomIcon size={24} color={styles.text_meta.color} />
                  </View>
                ) : (
                  <NumberIcon size={24} color={styles.text_meta.color} />
                )}
              </View>
              <Text className="text-[10px]" style={styles.text_meta}>
                {action === 'to_top' && '至顶'}
                {action === 'to_bottom' && '至底'}
                {!action && '定位'}
              </Text>
            </Pressable>
          )}
        />
        <View className="flex flex-row px-1">
          <Pressable
            className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleToggleCollect}>
            <View className="my-1">
              <StarIcon ref={starIconRef} size={24} filled={props.collected} />
            </View>
            <Text className="text-[10px]" style={styles.text_meta}>
              收藏
            </Text>
          </Pressable>
          <Pressable
            className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleThank}>
            <View className="my-1">
              <HeartIcon size={24} liked={props.thanked} ref={heartIconRef} />
            </View>
            <Text className="text-[10px]" style={styles.text_meta}>
              感谢
            </Text>
          </Pressable>
          <Pressable
            className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={props.onShare}>
            <View className="my-1">
              <ShareIcon size={24} color={iconColor} />
            </View>
            <Text className="text-[10px]" style={styles.text_meta}>
              分享
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
