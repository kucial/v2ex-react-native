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

function NodeTopicRow(props: NodeFeedRowProps) {
  const router = useRouter()
  const { data, showAvatar, isLast } = props

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

  const { member, replies } = data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
          pressed && rowStyles.pressed60,
        ]}
        onPressIn={() => {
          preloadTopicInfo(props.data.id)
        }}
        onPress={() => {
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
            <View style={rowStyles.skeletonAvatar}>
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
                  style={rowStyles.avatarBox}
                  recyclingKey={`user-avatar:${member.username}`}
                  source={{
                    uri: member.avatar_normal,
                  }}
                  priority='low'
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
                props.titleStyle === 'emphasized' && rowStyles.font600,
              ]}
            >
              {data.title}
            </Text>
            <View style={rowStyles.metaRow}>
              <Text
                style={[styles.text_desc, styles.text_xs, rowStyles.font600]}
              >
                {member.username}
              </Text>
              {!!data.characters && (
                <>
                  <Text
                    style={[styles.text_meta, styles.text_xs, rowStyles.px1]}
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
                    style={[styles.text_meta, styles.text_xs, rowStyles.px1]}
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
  centerContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  font600: {
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
  },
  px1: {
    paddingHorizontal: 4,
  },
  triangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.9,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default memo(NodeTopicRow)
