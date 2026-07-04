import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, InlineBox } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'
import { useViewedStatus } from '@/containers/ViewedTopicsService'

export default function MemberTopicRow(props: MemberFeedRowProps) {
  const { data, isLast } = props
  const router = useRouter()

  const { styles } = useTheme()
  const viewedStatus = useViewedStatus(data)
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <Pressable
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
          pressed && rowStyles.pressed,
        ]}
        onPress={() => {
          if (data) {
            router.push({
              pathname: '/topic/[id]',
              params: {
                id: props.data.id,
              },
            })
          }
        }}
      >
        <View style={rowStyles.mainPressableContent}>
          <View
            style={[
              rowStyles.leftContent,
              viewedStatus === 'viewed' && rowStyles.viewedOpacity,
            ]}
          >
            <View style={rowStyles.nodeRow}>
              <View>
                {data?.node ? (
                  <Pressable
                    hitSlop={4}
                    style={({ pressed }) => [
                      rowStyles.nodePressable,
                      styles.layer2,
                      pressed && rowStyles.pressed,
                    ]}
                    onPress={() => {
                      router.push({
                        pathname: '/node/[name]',
                        params: {
                          name: data.node.name,
                        },
                      })
                    }}
                  >
                    <Text style={[styles.text_meta, styles.text_xs]}>
                      {data.node.title}
                    </Text>
                  </Pressable>
                ) : (
                  <InlineBox
                    style={rowStyles.nodeSkeleton}
                    width={[50, 80]}
                  ></InlineBox>
                )}
              </View>
            </View>
            <View>
              {data?.title ? (
                <Text
                  style={[
                    styles.text,
                    styles.text_base,
                    props.titleStyle === 'emphasized' &&
                      rowStyles.titleEmphasized,
                  ]}
                >
                  {data.title}
                </Text>
              ) : (
                <BlockText style={styles.text_base} lines={[1, 3]} />
              )}

              <View style={rowStyles.metaRow}>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data?.last_reply_time}
                </Text>
                {data?.last_reply_by && (
                  <>
                    <Text style={[styles.text_meta, rowStyles.dot]}>•</Text>
                    <View style={rowStyles.replyByRow}>
                      <Text style={[styles.text_meta, styles.text_xs]}>
                        最后回复来自
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          rowStyles.usernamePressable,
                          pressed && rowStyles.pressed,
                        ]}
                        hitSlop={4}
                        onPress={() => {
                          router.push({
                            pathname: '/member/[username]',
                            params: {
                              username: data.last_reply_by,
                            },
                          })
                        }}
                      >
                        <Text
                          style={[
                            styles.text_meta,
                            styles.text_xs,
                            rowStyles.usernameText,
                          ]}
                        >
                          {data.last_reply_by}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            {data && !!data.replies && (
              <View style={[rowStyles.badge, styles.tag__bg]}>
                <Text style={styles.tag__text}>{data.replies}</Text>
              </View>
            )}
            {!data && (
              <InlineBox
                style={[rowStyles.badge, styles.text_xs]}
                width={[26, 36]}
              />
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
      </Pressable>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftContent: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 12,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nodePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  nodeSkeleton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  titleEmphasized: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  dot: {
    paddingHorizontal: 8,
  },
  replyByRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernamePressable: {
    paddingHorizontal: 4,
  },
  usernameText: {
    fontWeight: '600',
  },
  rightContent: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  triangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.6,
  },
})
