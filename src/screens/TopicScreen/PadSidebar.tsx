import { useEffect } from 'react'
import {
  ChatBubbleBottomCenterTextIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import {
  HeartIcon as FilledHeartIcon,
  StarIcon as FilledStarIcon,
} from 'react-native-heroicons/solid'

import AppSidebarButton from '@/components/AppSidebar/AppSidebarButton'
import { useAppLayout } from '@/components/Layout'
import NumberIcon from '@/components/NumberIcon'

import { useTheme } from '@/containers/ThemeService'

import ScrollControl from './ScrollControl'
import ToBottomIcon from './ToBottomIcon'
import { BarProps } from './types'

export default function PadSidebar(props: BarProps) {
  const {
    isFocused,
    onInitReply,
    scrollControlRef,
    repliesCount,
    onNavTo,
    collected,
    onToggleCollect,
    thanked,
    onThankTopic,
    onShare,
  } = props
  const { setPageNav } = useAppLayout()
  const { theme } = useTheme()
  useEffect(() => {
    setPageNav(
      isFocused ? (
        <>
          <AppSidebarButton
            isActive={false}
            label='评论'
            activeColor={theme.colors.primary}
            staticColor={theme.colors.text_desc}
            Icon={ChatBubbleBottomCenterTextIcon}
            onPress={() => {
              onInitReply()
            }}
          />
          <ScrollControl
            ref={scrollControlRef}
            max={repliesCount}
            onNavTo={onNavTo}
            renderButton={({ action, onPress }) => {
              let Icon
              let label
              switch (action) {
                case 'to_top':
                  Icon = ToBottomIcon
                  label = '至顶'
                  break
                case 'to_bottom':
                  Icon = ToBottomIcon
                  label = '至底'
                  break
                default:
                  Icon = NumberIcon
                  label = '定位'
              }
              return (
                <AppSidebarButton
                  isActive={false}
                  label={label}
                  iconStyle={
                    action === 'to_top' && {
                      transform: [{ rotate: '180deg' }],
                    }
                  }
                  activeColor={theme.colors.primary}
                  staticColor={theme.colors.text_desc}
                  Icon={Icon}
                  onPress={onPress}
                />
              )
            }}
          />
          <AppSidebarButton
            isActive={collected}
            label='收藏'
            activeColor={theme.colors.icon_collected_bg}
            staticColor={theme.colors.text_desc}
            Icon={collected ? FilledStarIcon : StarIcon}
            onPress={onToggleCollect}
          />
          <AppSidebarButton
            isActive={thanked}
            label='感谢'
            activeColor={theme.colors.icon_liked_bg}
            staticColor={theme.colors.text_desc}
            Icon={thanked ? FilledHeartIcon : HeartIcon}
            onPress={onThankTopic}
          />
          <AppSidebarButton
            isActive={false}
            label='分享'
            activeColor={theme.colors.text_desc}
            staticColor={theme.colors.text_desc}
            Icon={ShareIcon}
            onPress={onShare}
          />
        </>
      ) : null,
    )
    return () => {
      setPageNav(null)
    }
  }, [
    setPageNav,
    isFocused,
    onInitReply,
    scrollControlRef,
    repliesCount,
    onNavTo,
    collected,
    onToggleCollect,
    thanked,
    onThankTopic,
    onShare,
    theme.colors.primary,
    theme.colors.text_desc,
    theme.colors.icon_collected_bg,
    theme.colors.icon_liked_bg,
  ])

  return null
}
