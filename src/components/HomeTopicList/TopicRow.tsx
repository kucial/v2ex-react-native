import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'
import { useViewedStatus } from '@/containers/ViewedTopicsService'
import { areTopicRowPropsEqual } from '@/utils/memo'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

function TopicRow(props: HomeFeedRowProps) {
  const { data, showAvatar, showLastReplyMember, titleStyle } = props
  const router = useRouter()
  const { styles, theme } = useTheme()
  const viewedStatus = useViewedStatus(data)

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, styles.border_b_light]}>
          <View style={rowStyles.skeletonLeft}>
            <View style={rowStyles.skeletonHeader}>
              {showAvatar && <Box style={rowStyles.skeletonAvatar} />}
              <View>
                <View style={rowStyles.skeletonNode}>
                  <InlineText style={styles.text_xs}></InlineText>
                </View>
              </View>
              <Text style={{ color: theme.colors.skeleton }}>·</Text>
              <View>
                <InlineText
                  width={[56, 80]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
            <View style={rowStyles.skeletonBody}>
              <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
              <View style={rowStyles.mt2}>
                <InlineText
                  width={[80, 120]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            <Box style={rowStyles.badgeBox}>
              <InlineText width={8} style={styles.text_xs} />
            </Box>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { node, member, title, replies } = data
  const lastReplyBy = data.last_reply_by

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TopicRow'
        accessibilityLabel={title}
        style={({ pressed }) => [
          rowStyles.mainPressable,
          styles.layer1,
          styles.border_b_light,
          pressed && rowStyles.pressed50,
        ]}
        onPressIn={() => {
          preloadTopicInfo(data.id)
        }}
        onPress={() => {
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: data.id,
            },
          })
        }}
      >
        <View style={rowStyles.mainPressableContent}>
          {showAvatar ? (
            <View style={rowStyles.avatarContainer}>
              <FixedPressable
                onPress={() => {
                  router.push({
                    pathname: '/member/[username]',
                    params: {
                      username: member.username,
                    },
                  })
                }}
              >
                <Image
                  recyclingKey={`user-avatar:${member.username}`}
                  source={{
                    uri: member.avatar_normal,
                  }}
                  style={rowStyles.avatarImage}
                />
              </FixedPressable>
            </View>
          ) : (
            <View style={rowStyles.pl3}></View>
          )}

          <View
            style={[
              rowStyles.centerContent,
              viewedStatus === 'viewed' && rowStyles.viewedOpacity,
            ]}
          >
            <View style={rowStyles.headerRow}>
              <View>
                <FixedPressable
                  hitSlop={4}
                  style={({ pressed }) => [
                    rowStyles.nodePressable,
                    styles.layer2,
                    pressed && rowStyles.pressed60,
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/node/[name]',
                      params: {
                        name: node.name,
                      },
                    })
                  }}
                >
                  <Text style={[styles.text_desc, styles.text_xs]}>
                    {node.title}
                  </Text>
                </FixedPressable>
              </View>
              <Text style={[styles.text_meta, rowStyles.px1]}>·</Text>
              <View style={rowStyles.top1}>
                <FixedPressable
                  style={({ pressed }) => pressed && rowStyles.pressed60}
                  hitSlop={5}
                  onPress={() => {
                    router.push({
                      pathname: '/member/[username]',
                      params: {
                        username: member.username,
                      },
                    })
                  }}
                >
                  <Text
                    style={[
                      styles.text_desc,
                      styles.text_xs,
                      rowStyles.font600,
                    ]}
                  >
                    {member.username}
                  </Text>
                </FixedPressable>
              </View>
            </View>
            <View>
              <Text
                style={[
                  styles.text,
                  styles.text_base,
                  titleStyle === 'emphasized' && rowStyles.font500,
                ]}
              >
                {title}
              </Text>
              <View style={rowStyles.metaRow}>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data?.last_reply_time}
                </Text>
                {data?.last_reply_time &&
                  showLastReplyMember &&
                  data?.last_reply_by && (
                    <Text
                      style={[styles.text_meta, styles.text_xs, rowStyles.px2]}
                    >
                      •
                    </Text>
                  )}
                {showLastReplyMember && lastReplyBy && (
                  <View style={rowStyles.rowCenter}>
                    <Text style={[styles.text_meta, styles.text_xs]}>
                      最后回复来自
                    </Text>
                    <FixedPressable
                      style={({ pressed }) => [
                        rowStyles.px1,
                        pressed && rowStyles.pressed60,
                      ]}
                      hitSlop={4}
                      onPress={() => {
                        router.push({
                          pathname: '/member/[username]',
                          params: {
                            username: lastReplyBy,
                            tab: 'replies',
                          },
                        })
                      }}
                    >
                      <Text
                        style={[
                          styles.text_desc,
                          styles.text_xs,
                          rowStyles.font600,
                        ]}
                      >
                        {lastReplyBy}
                      </Text>
                    </FixedPressable>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            <View>
              {!!replies && (
                <View style={[rowStyles.badgeBox, styles.tag__bg]}>
                  <Text style={styles.tag__text}>{replies}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {viewedStatus === 'has_update' && (
          <TriangleCorner
            corner='top-left'
            size={10}
            style={rowStyles.triangle}
          />
        )}
      </FixedPressable>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonLeft: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    marginBottom: 4,
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonNode: {
    paddingVertical: 2,
    borderRadius: 4,
    width: 50,
  },
  skeletonBody: {
    paddingLeft: 34,
  },
  mt2: {
    marginTop: 8,
  },
  rightContent: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  pl3: {
    paddingLeft: 12,
  },
  centerContent: {
    flex: 1,
    paddingVertical: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 4,
  },
  nodePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  px1: {
    paddingHorizontal: 4,
  },
  px2: {
    paddingHorizontal: 8,
  },
  top1: {
    top: 1,
  },
  font600: {
    fontWeight: '600',
  },
  font500: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.9,
  },
  pressed50: {
    opacity: 0.5,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default memo(TopicRow, areTopicRowPropsEqual)
