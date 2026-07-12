import { useEffect } from 'react'

import AppSidebarButton from '@/components/AppSidebar/AppSidebarButton'
import V2exIcon from '@/components/icons/V2exIcon'
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
            Icon={(props) => (
              <V2exIcon
                name='chat-bubble-bottom-center-text-outline'
                {...props}
              />
            )}
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
                    action === 'to_top'
                      ? {
                          transform: [{ rotate: '180deg' }],
                        }
                      : undefined
                  }
                  activeColor={theme.colors.primary}
                  staticColor={theme.colors.text_desc}
                  Icon={Icon as any}
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
            Icon={
              collected
                ? (props) => <V2exIcon name='star-solid' {...props} />
                : (props) => <V2exIcon name='star-outline' {...props} />
            }
            onPress={onToggleCollect}
          />
          <AppSidebarButton
            isActive={thanked}
            label='感谢'
            activeColor={theme.colors.icon_liked_bg}
            staticColor={theme.colors.text_desc}
            Icon={
              thanked
                ? (props) => <V2exIcon name='heart-solid' {...props} />
                : (props) => <V2exIcon name='heart-outline' {...props} />
            }
            onPress={onThankTopic}
          />
          <AppSidebarButton
            isActive={false}
            label='分享'
            activeColor={theme.colors.text_desc}
            staticColor={theme.colors.text_desc}
            Icon={(props) => <V2exIcon name='share-outline' {...props} />}
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
