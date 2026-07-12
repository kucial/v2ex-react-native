import { useCallback, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsFocused } from 'expo-router/react-navigation'
import LottieView from 'lottie-react-native'

import HeartIcon from '@/components/HeartIcon'
import V2exIcon from '@/components/icons/V2exIcon'
import NumberIcon from '@/components/NumberIcon'
import StarIcon from '@/components/StarIcon'
import ToBottomIcon from '@/components/ToBottomIcon'

import { useTheme } from '@/containers/ThemeService'
import { useScreenBottomBarReporter } from '@/stores/uiMetrics'

import ScrollControl from './ScrollControl'
import { BarProps } from './types'

export default function BottomBar(props: BarProps) {
  const {
    thanked,
    onThankTopic,
    collected,
    onToggleCollect,
    onInitReply,
    scrollControlRef,
    repliesCount,
    onNavTo,
    onShare,
  } = props
  const { styles, theme } = useTheme()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  // Publish the bar height so MiniPlayerBar docks above it instead of
  // covering it.
  const handleBarLayout = useScreenBottomBarReporter(isFocused)

  const iconColor = theme.colors.text_meta
  const heartIconRef = useRef<LottieView>(null)
  const starIconRef = useRef<LottieView>(null)

  const handleThank = useCallback(() => {
    if (thanked) {
      return
    }
    heartIconRef.current?.play()
    onThankTopic()
  }, [onThankTopic, thanked])

  const handleToggleCollect = useCallback(() => {
    if (collected) {
      starIconRef.current?.reset()
    } else {
      starIconRef.current?.play()
    }
    onToggleCollect()
  }, [onToggleCollect, collected])

  return (
    <View
      onLayout={handleBarLayout}
      style={[
        styles.overlay,
        styles.border_t_light,
        { paddingBottom: insets.bottom },
      ]}
    >
      <View style={bottomBarStyles.row}>
        <View style={bottomBarStyles.inputWrap}>
          <Pressable
            hitSlop={5}
            style={({ pressed }) => [
              bottomBarStyles.inputBtn,
              styles.overlay_input__bg,
              pressed && bottomBarStyles.pressed60,
            ]}
            onPress={() => {
              onInitReply()
            }}
          >
            <Text style={[styles.text_placeholder, styles.text_sm]}>
              发表评论
            </Text>
          </Pressable>
        </View>
        <ScrollControl
          ref={scrollControlRef}
          max={repliesCount}
          onNavTo={onNavTo}
          renderButton={({ action, onPress, disabled }) => (
            <Pressable
              style={({ pressed }) => [
                bottomBarStyles.iconBtn,
                disabled && bottomBarStyles.disabled50,
                pressed && bottomBarStyles.pressed60,
              ]}
              disabled={disabled}
              onPress={onPress}
            >
              <View style={bottomBarStyles.iconMargin}>
                {action ? (
                  <View
                    style={
                      action === 'to_top' && {
                        transform: [{ rotate: '180deg' }],
                      }
                    }
                  >
                    <ToBottomIcon size={24} color={styles.text_meta.color} />
                  </View>
                ) : (
                  <NumberIcon size={24} color={styles.text_meta.color} />
                )}
              </View>
              <Text style={[bottomBarStyles.iconText, styles.text_meta]}>
                {action === 'to_top' && '至顶'}
                {action === 'to_bottom' && '至底'}
                {!action && '定位'}
              </Text>
            </Pressable>
          )}
        />
        <View style={bottomBarStyles.rightGroup}>
          <Pressable
            style={({ pressed }) => [
              bottomBarStyles.iconBtn,
              pressed && bottomBarStyles.pressed60,
            ]}
            onPress={handleToggleCollect}
          >
            <View style={bottomBarStyles.iconMargin}>
              <StarIcon ref={starIconRef} size={24} filled={collected} />
            </View>
            <Text style={[bottomBarStyles.iconText, styles.text_meta]}>
              收藏
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              bottomBarStyles.iconBtn,
              pressed && bottomBarStyles.pressed60,
            ]}
            onPress={handleThank}
          >
            <View style={bottomBarStyles.iconMargin}>
              <HeartIcon size={24} liked={thanked} ref={heartIconRef} />
            </View>
            <Text style={[bottomBarStyles.iconText, styles.text_meta]}>
              感谢
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              bottomBarStyles.iconBtn,
              pressed && bottomBarStyles.pressed60,
            ]}
            onPress={onShare}
          >
            <View style={bottomBarStyles.iconMargin}>
              <V2exIcon name='share-outline' size={24} color={iconColor} />
            </View>
            <Text style={[bottomBarStyles.iconText, styles.text_meta]}>
              分享
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const bottomBarStyles = StyleSheet.create({
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
  },
  inputWrap: {
    flex: 1,
    marginRight: 8,
  },
  inputBtn: {
    height: 32,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pressed60: {
    opacity: 0.6,
  },
  disabled50: {
    opacity: 0.5,
  },
  iconBtn: {
    width: 46,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginVertical: 4,
  },
  iconText: {
    fontSize: 10,
  },
  rightGroup: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
})
