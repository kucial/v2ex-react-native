import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import {
  ArrowsPointingOutIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from 'react-native-heroicons/outline'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { usePanelSheet } from '@/stores/panelSheet'

import HtmlRender from '../HtmlRender'
import MaxWidthWrapper from '../MaxWidthWrapper'

export default function TopicCard(props: PlanetFeedRowProps) {
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(maxContainerWidth, width)
  const { data, showAvatar, titleStyle } = props
  const router = useRouter()
  const { styles, theme } = useTheme()
  const iconColor = theme.colors.text_meta
  const { openPanelSheet } = usePanelSheet()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View className={cn('flex flex-row items-center')}>
          <View className='flex-1 py-2 pl-1'>
            <View className='flex flex-row items-center space-x-2 pl-1 mb-1'>
              {showAvatar && <Box className='w-[24px] h-[24px] rounded mr-2' />}
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
            <View className='pl-[34px] pr-4'>
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
    <MaxWidthWrapper
      style={styles.layer1}
      className='rounded-lg overflow-hidden'
    >
      <View
        sentry-label='TopicRow'
        className={cn('flex flex-row items-center')}
        style={[styles.layer1]}
      >
        {showAvatar ? (
          <View className='px-2 py-2 self-start'>
            <FixedPressable
              className='active:opacity-50'
              onPress={() => {
                router.push({
                  pathname: '/planet/[site_address]',
                  params: {
                    site_address: planet.site_address,
                  },
                })
              }}
            >
              <Image
                recyclingKey={`site_avatar:${planet.site_address}`}
                source={{
                  uri: planet.avatar,
                }}
                className='w-[24px] h-[24px] rounded'
              />
            </FixedPressable>
          </View>
        ) : (
          <View className='pl-3'></View>
        )}

        <View
          className={cn(
            'flex-1 py-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}
        >
          <View className='flex flex-row items-center pt-[2px] space-x-1 mb-1'>
            <View>
              <FixedPressable
                hitSlop={4}
                className='py-[2px] px-[6px] rounded active:opacity-60'
                style={styles.layer2}
                onPress={() => {
                  router.push({
                    pathname: '/planet/[site_address]',
                    params: {
                      site_address: planet.site_address,
                    },
                  })
                }}
              >
                <Text style={[styles.text_desc, styles.text_xs]}>
                  {planet.site_title}
                </Text>
              </FixedPressable>
            </View>
            <View className='mx-1'>
              <Text>·</Text>
            </View>
            <View className=''>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {data.updated_at}
              </Text>
            </View>
          </View>
          <View className='pr-4'>
            {title && (
              <Pressable
                onPress={() => {
                  openPanelSheet(data)
                }}
              >
                <Text
                  className={cn({
                    'font-[500]': titleStyle === 'emphasized',
                  })}
                  style={[styles.text, styles.text_base]}
                >
                  {title}
                </Text>
              </Pressable>
            )}
            {data.expand_label ? (
              <Pressable
                style={styles.layer2}
                className='py-1 px-[6px] rounded flex-row items-center active:opacity-50'
                onPress={() => {
                  openPanelSheet(data)
                }}
              >
                <Text style={[styles.text_base, styles.text_meta]}>
                  {data.expand_label}
                </Text>

                <View className='ml-auto mr-1'>
                  <ArrowsPointingOutIcon color={iconColor} size={16} />
                </View>
              </Pressable>
            ) : (
              <HtmlRender
                source={{ html: data.content }}
                contentWidth={CONTAINER_WIDTH - 24 - 8 - 8 - 16}
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
