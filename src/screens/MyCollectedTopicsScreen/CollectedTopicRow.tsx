import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, Box, InlineBox } from '@/components/Skeleton/Elements'

import { useTheme } from '@/containers/ThemeService'

const CollectedTopicRow = (props: CollectedTopicRowProps) => {
  const { data, isLast } = props
  const router = useRouter()

  const { styles } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, !isLast && styles.border_b_light]}>
          <View style={rowStyles.skeletonAvatar}>
            <Box style={rowStyles.avatarBox} />
          </View>
          <View style={rowStyles.skeletonBody}>
            <View>
              <BlockText style={styles.text_base} lines={[1, 3]}></BlockText>
              <View style={rowStyles.mt2}>
                <BlockText style={styles.text_xs} lines={2} />
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            <InlineBox
              style={[rowStyles.badgeBox, styles.text_xs]}
              width={[26, 36]}
            />
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        accessibilityLabel={data.title}
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
          pressed && rowStyles.pressed60,
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
          <View style={rowStyles.avatarContainer}>
            {data.member.avatar_normal ? (
              <FixedPressable
                onPress={() => {
                  router.push({
                    pathname: '/member/[username]',
                    params: {
                      username: data.member.username,
                    },
                  })
                }}
              >
                <Image
                  recyclingKey={`user:${data.member.username}`}
                  style={rowStyles.avatarImage}
                  source={{ uri: data.member.avatar_normal }}
                />
              </FixedPressable>
            ) : (
              <Box style={rowStyles.avatarBox} />
            )}
          </View>
          <View style={rowStyles.centerContent}>
            <View>
              <Text
                style={[
                  styles.text,
                  styles.text_base,
                  props.titleStyle === 'emphasized' && rowStyles.font500,
                ]}
              >
                {data.title}
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
                        name: data.node.name,
                        brief: data.node,
                      },
                    })
                  }}
                >
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    {data.node.title}
                  </Text>
                </FixedPressable>
                <Text style={[styles.text_meta, rowStyles.px1]}>•</Text>
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
                        username: data.member.username,
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
                    {data.member.username}
                  </Text>
                </FixedPressable>
                <Text style={[styles.text_meta, rowStyles.px1]}>•</Text>

                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data?.last_reply_time}
                </Text>
                {data?.last_reply_by && (
                  <>
                    <Text style={[styles.text_meta, rowStyles.px1]}>•</Text>
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
                  </>
                )}
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            {data && !!data.replies && (
              <View style={[rowStyles.badgeBox, styles.tag__bg]}>
                <Text style={[styles.tag__text, styles.text_xs]}>
                  {data.replies}
                </Text>
              </View>
            )}
          </View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  skeletonAvatar: {
    alignSelf: 'flex-start',
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  skeletonBody: {
    flex: 1,
    paddingLeft: 8,
  },
  mt2: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rightContent: {
    width: 64,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  mainPressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    alignSelf: 'flex-start',
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  centerContent: {
    flex: 1,
    paddingLeft: 8,
  },
  font500: {
    fontWeight: '500',
  },
  font600: {
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  nodePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  px1: {
    paddingHorizontal: 4,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default CollectedTopicRow
