import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'
import { useViewedStatus } from '@/containers/ViewedTopicsService'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

function TideTopicRow(props: HomeFeedRowProps) {
  const { data, showAvatar, showLastReplyMember, isLast } = props
  const router = useRouter()
  const { styles } = useTheme()
  const viewedStatus = useViewedStatus(data)

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, !isLast && styles.border_b_light]}>
          {showAvatar ? (
            <View style={rowStyles.skeletonAvatar}>
              <Box style={rowStyles.avatarBox} />
            </View>
          ) : (
            <View style={rowStyles.pl3}></View>
          )}
          <View style={rowStyles.skeletonBody}>
            <BlockText lines={[1, 2]} style={styles.text_base}></BlockText>
            <View style={rowStyles.mt1}>
              <InlineText width={[80, 120]} style={styles.text_xs}></InlineText>
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

  const { node, member, title, replies } = props.data
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TideTopicRow'
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
          pressed && rowStyles.pressed50,
        ]}
        onPress={() => {
          preloadTopicInfo(props.data.id)
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: props.data.id,
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
            <Text
              style={[
                styles.text,
                styles.text_base,
                props.titleStyle === 'emphasized' && rowStyles.font500,
              ]}
            >
              {title}
            </Text>
            <View style={rowStyles.metaRow}>
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
              {!showLastReplyMember && data?.last_reply_time && (
                <View style={rowStyles.mr1}>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    最后回复
                  </Text>
                </View>
              )}
              <Text style={[styles.text_meta, styles.text_xs]}>
                {data?.last_reply_time}
              </Text>
              {data?.last_reply_time &&
                showLastReplyMember &&
                data?.last_reply_by && (
                  <Text
                    style={[styles.text_meta, styles.text_xs, rowStyles.px1]}
                  >
                    •
                  </Text>
                )}
              {showLastReplyMember && data?.last_reply_by && (
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
                          username: data.last_reply_by,
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
                      {data.last_reply_by}
                    </Text>
                  </FixedPressable>
                </View>
              )}
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            {!!replies && (
              <View style={[rowStyles.badgeBoxTide, styles.tag__bg]}>
                <Text style={[styles.tag__text, styles.text_xs]}>
                  {replies}
                </Text>
              </View>
            )}
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
  skeletonAvatar: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  pl3: {
    paddingLeft: 12,
  },
  skeletonBody: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  mt1: {
    marginTop: 4,
  },
  rightContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 4,
    paddingRight: 8,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  badgeBoxTide: {
    borderRadius: 9999,
    paddingHorizontal: 4,
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
  centerContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  font500: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  nodePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    borderRadius: 4,
  },
  mr1: {
    marginRight: 4,
  },
  px1: {
    paddingHorizontal: 4,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  font600: {
    fontWeight: '600',
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

export default memo(TideTopicRow)
