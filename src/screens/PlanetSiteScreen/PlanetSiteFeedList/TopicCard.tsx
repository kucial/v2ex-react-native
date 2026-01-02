import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import {
  ArrowsPointingOutIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from 'react-native-heroicons/outline'

import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { usePanelSheet } from '@/stores/panelSheet'

export default function TopicCard(props: PlanetFeedRowProps) {
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(maxContainerWidth, width)
  const { data, titleStyle } = props
  const { styles, theme } = useTheme()
  const iconColor = theme.colors.text_meta
  const { openPanelSheet } = usePanelSheet()

  if (!data) {
    return (
      <MaxWidthWrapper
        style={styles.layer2}
        className='rounded-lg overflow-hidden'
      >
        <View className={cn('flex flex-row items-center', 'px-3')}>
          <View className='flex-1 py-2'>
            <View className='flex flex-row items-center mb-1'>
              <View>
                <View className='py-[2px] rounded w-[50px]'>
                  <InlineText style={styles.text_xs}></InlineText>
                </View>
              </View>
              <View className='mx-1'></View>
              <View className='relative'>
                <InlineText
                  width={[56, 80]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
            <View className=''>
              <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
              <View className='mt-2'>
                <InlineText
                  width={[80, 120]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { title, uuid, planet } = props.data

  return (
    <MaxWidthWrapper className='rounded-lg overflow-hidden'>
      <View
        sentry-label='TopicRow'
        className={cn('flex flex-row items-center')}
        style={[styles.layer1]}
      >
        <View className='pl-3'></View>
        <View
          className={cn(
            'flex-1 py-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}
        >
          <View className='flex flex-row items-center pt-[2px] space-x-1 mb-1'>
            <View className=''>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {data.updated_at}
              </Text>
            </View>
          </View>
          <View className='pr-3'>
            {title && (
              <Text
                className={cn({
                  'font-[500]': titleStyle === 'emphasized',
                })}
                style={[styles.text, styles.text_base]}
              >
                {title}
              </Text>
            )}
            {data.expand_label ? (
              <Pressable
                style={styles.layer2}
                className='p-1 rounded flex-row items-center active:opacity-50'
                onPress={() => {
                  openPanelSheet(data)
                }}
              >
                <Text
                  style={[styles.text_sm, styles.text_base, styles.text_meta]}
                >
                  {data.expand_label}
                </Text>

                <View className='ml-auto mr-1'>
                  <ArrowsPointingOutIcon color={iconColor} size={16} />
                </View>
              </Pressable>
            ) : (
              <HtmlRender
                source={{ html: data.content }}
                contentWidth={CONTAINER_WIDTH - 40}
              />
            )}
            <View className='mt-2 flex flex-row justify-between gap-x-3 pr-12'>
              <View className='flex-1 flex-row gap-1 items-center'>
                <ChatBubbleLeftIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.comment_count}
                </Text>
              </View>
              <View className='flex-1 flex-row gap-1 items-center'>
                <HeartIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.liked_count}
                </Text>
              </View>
              <View className='flex-1 flex-row gap-1 items-center'>
                <ChartBarIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.stats_num}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </MaxWidthWrapper>
  )
}
