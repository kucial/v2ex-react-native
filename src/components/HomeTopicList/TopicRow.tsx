import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

export default function TopicRow(props: HomeFeedRowProps) {
  const { data, showAvatar, showLastReplyMember, titleStyle } = props
  const router = useRouter()
  const { styles, theme } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className={cn('flex flex-row items-center')}
          style={[styles.border_b_light]}
        >
          <View className='flex-1 py-2 pl-1'>
            <View className='flex flex-row items-center space-x-2 pl-1 mb-1'>
              {showAvatar && <Box className='w-[24px] h-[24px] rounded mr-2' />}
              <View>
                <View className='py-[2px] rounded w-[50px]'>
                  <InlineText style={styles.text_xs}></InlineText>
                </View>
              </View>
              <Text style={{ color: theme.colors.skeleton }}>·</Text>
              <View className='relative'>
                <InlineText
                  width={[56, 80]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
            <View className='pl-[34px]'>
              <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
              <View className='mt-2'>
                <InlineText
                  width={[80, 120]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
          </View>
          <View className='w-[80px] flex flex-row justify-end pr-4'>
            <Box className='rounded-full px-2'>
              <InlineText width={8} style={styles.text_xs} />
            </Box>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { node, member, title, replies } = props.data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TopicRow'
        className={cn('flex flex-row items-center', 'active:opacity-50')}
        style={[styles.layer1, styles.border_b_light]}
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
                source={{
                  uri: member.avatar_normal,
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
                    pathname: '/node/[name]',
                    params: {
                      name: node.name,
                      // brief: node,
                    },
                  })
                }}
              >
                <Text style={[styles.text_desc, styles.text_xs]}>
                  {node.title}
                </Text>
              </FixedPressable>
            </View>
            <Text style={styles.text_meta} className='px-1'>
              ·
            </Text>
            <View className='relative top-[1px]'>
              <FixedPressable
                className='active:opacity-60'
                hitSlop={5}
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
                <Text
                  className='font-[600]'
                  style={[styles.text_desc, styles.text_xs]}
                >
                  {member.username}
                </Text>
              </FixedPressable>
            </View>
          </View>
          <View>
            <Text
              className={cn({
                'font-[500]': titleStyle === 'emphasized',
              })}
              style={[styles.text, styles.text_base]}
            >
              {title}
            </Text>
            <View className='mt-2 flex flex-row items-center'>
              <Text style={[styles.text_meta, styles.text_xs]}>
                {data?.last_reply_time}
              </Text>
              {data?.last_reply_time &&
                showLastReplyMember &&
                data?.last_reply_by && (
                  <Text
                    className='px-2'
                    style={[styles.text_meta, styles.text_xs]}
                  >
                    •
                  </Text>
                )}
              {showLastReplyMember && data?.last_reply_by && (
                <View className='flex flex-row items-center'>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    最后回复来自
                  </Text>
                  <FixedPressable
                    className='px-1 active:opacity-60'
                    hitSlop={4}
                    onPress={() => {
                      router.push({
                        pathname: '/member/[username]',
                        params: {
                          username: data.last_reply_by,
                          tab: 'replies',
                        },
                      })
                    }}
                  >
                    <Text
                      className='font-[600]'
                      style={[styles.text_desc, styles.text_xs]}
                    >
                      {data.last_reply_by}
                    </Text>
                  </FixedPressable>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className='w-[80px] flex flex-row justify-end pr-4'>
          <View className='relative'>
            {!!replies && (
              <View className='rounded-full px-2' style={styles.tag__bg}>
                <Text style={styles.tag__text}>{replies}</Text>
              </View>
            )}
          </View>
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
