import { memo } from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import {
  BlockText,
  Box,
  InlineBox,
  InlineText,
} from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

function NodeTopicRow(props: NodeFeedRowProps) {
  const { styles } = useTheme()
  const router = useRouter()
  const { data, showAvatar, isLast } = props

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className={cn('flex flex-row items-center')}
          style={!isLast && styles.border_b_light}
        >
          {showAvatar ? (
            <View className='px-2 py-2 self-start'>
              <InlineBox className='w-[24px] h-[24px] rounded' />
            </View>
          ) : (
            <View className='pl-3'></View>
          )}
          <View className='flex-1 py-2'>
            <BlockText style={styles.text_base} lines={[1, 3]} />
            <View className='mt-2 flex flex-row space-x-1'>
              <InlineText style={styles.text_xs} width={[58, 80]} />
            </View>
          </View>

          <View className='w-[80px] flex flex-row items-center justify-end pr-2'>
            <Box className='rounded-full px-2'>
              <InlineText width={8} style={styles.text_xs} />
            </Box>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { member } = data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        className={cn('flex flex-row items-center', 'active:opacity-50')}
        style={!isLast && styles.border_b_light}
        onPressIn={() => {
          preloadTopicInfo(props.data.id)
        }}
        onPress={() => {
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: props.data.id,
              // brief: props.data,
            },
          })
        }}
      >
        {showAvatar ? (
          <View className='px-2 py-2 self-start'>
            <FixedPressable
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: member.username,
                    // brief: member,
                  },
                })
              }}
            >
              <Image
                recyclingKey={`user-avatar:${member.username}`}
                className='w-[24px] h-[24px] rounded'
                source={{
                  uri: member.avatar_normal,
                }}
                priority='low'
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
          <Text
            className={cn({
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}
          >
            {data.title}
          </Text>
          <View className='mt-2 flex flex-row'>
            <Text
              className='font-[600]'
              style={[styles.text_desc, styles.text_xs]}
            >
              {member.username}
            </Text>
            {!!data.characters && (
              <>
                <Text
                  className='px-1'
                  style={[styles.text_meta, styles.text_xs]}
                >
                  ·
                </Text>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.characters} 字符
                </Text>
              </>
            )}
            {!!data.clicks && (
              <>
                <Text
                  className='px-1'
                  style={[styles.text_meta, styles.text_xs]}
                >
                  ·
                </Text>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.clicks} 次点击
                </Text>
              </>
            )}
          </View>
        </View>

        <View className='w-[80px] flex flex-row items-center justify-end pr-2'>
          {!!data.replies && (
            <View className='rounded-full px-2' style={styles.tag__bg}>
              <Text style={styles.tag__text}>{data.replies}</Text>
            </View>
          )}
        </View>

        {props.viewedStatus === 'has_update' && (
          <TriangleCorner
            corner='top-left'
            size={10}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              opacity: 0.9,
            }}
          />
        )}
      </FixedPressable>
    </MaxWidthWrapper>
  )
}
export default memo(NodeTopicRow)
