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
  const { setPageNav } = useAppLayout()
  const { theme } = useTheme()
  useEffect(() => {
    setPageNav(
      props.isFocused ? (
        <>
          <AppSidebarButton
            isActive={false}
            label="评论"
            activeColor={theme.colors.primary}
            staticColor={theme.colors.text_desc}
            Icon={ChatBubbleBottomCenterTextIcon}
            onPress={() => {
              props.onInitReply()
            }}
          />
          <ScrollControl
            ref={props.scrollControlRef}
            max={props.repliesCount}
            onNavTo={props.onNavTo}
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
            isActive={props.collected}
            label="收藏"
            activeColor={theme.colors.icon_collected_bg}
            staticColor={theme.colors.text_desc}
            Icon={props.collected ? FilledStarIcon : StarIcon}
            onPress={props.onToggleCollect}
          />
          <AppSidebarButton
            isActive={props.thanked}
            label="感谢"
            activeColor={theme.colors.icon_liked_bg}
            staticColor={theme.colors.text_desc}
            Icon={props.thanked ? FilledHeartIcon : HeartIcon}
            onPress={props.onThankTopic}
          />
          <AppSidebarButton
            isActive={false}
            label="分享"
            activeColor={theme.colors.text_desc}
            staticColor={theme.colors.text_desc}
            Icon={ShareIcon}
            onPress={props.onShare}
          />
        </>
      ) : null,
    )
    return () => {
      setPageNav(null)
    }
  }, [
    setPageNav,
    props.repliesCount,
    props.thanked,
    props.collected,
    props.onNavTo,
    props.isFocused,
  ])

  return null
}
