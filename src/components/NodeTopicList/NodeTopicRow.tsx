import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
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
import { useViewedStatus } from '@/containers/ViewedTopicsService'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

function NodeTopicRow(props: NodeFeedRowProps) {
  const { styles } = useTheme()
  const router = useRouter()
  const { data, showAvatar, isLast } = props
  const viewedStatus = useViewedStatus(data)

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, !isLast && styles.border_b_light]}>
          {showAvatar ? (
            <View style={rowStyles.skeletonAvatar}>
              <InlineBox style={rowStyles.avatarBox} />
            </View>
          ) : (
            <View style={rowStyles.pl3}></View>
          )}
          <View style={rowStyles.skeletonBody}>
            <BlockText style={styles.text_base} lines={[1, 3]} />
            <View style={rowStyles.mt2}>
              <InlineText style={styles.text_xs} width={[58, 80]} />
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

  const { member } = data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
          pressed && rowStyles.pressed50,
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
                  recyclingKey={`user-avatar:${member.username}`}
                  style={rowStyles.avatarBox}
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
                props.titleStyle === 'emphasized' && rowStyles.font500,
              ]}
            >
              {data.title}
            </Text>
            <View style={rowStyles.mt2}>
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
            {!!data.replies && (
              <View style={[rowStyles.badgeBox, styles.tag__bg]}>
                <Text style={styles.tag__text}>{data.replies}</Text>
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
    paddingVertical: 8,
  },
  mt2: {
    marginTop: 8,
    flexDirection: 'row',
  },
  rightContent: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
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
  centerContent: {
    flex: 1,
    paddingVertical: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  font500: {
    fontWeight: '500',
  },
  font600: {
    fontWeight: '600',
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
  pressed50: {
    opacity: 0.5,
  },
})

export default memo(NodeTopicRow)
