import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import TimeAgo from '@/components/TimeAgo'

import { useTheme } from '@/containers/ThemeService'

const ViewedTopicRow = (props: ViewedTopicRowProps) => {
  const { data, showAvatar, isLast } = props
  const router = useRouter()
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        style={[viewedRowStyles.pressable, !isLast && styles.border_b_light]}
        onPress={() => {
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: data.id,
              // brief: data,
            },
          })
        }}
      >
        {showAvatar ? (
          <View style={viewedRowStyles.avatarCol}>
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
                style={viewedRowStyles.avatar}
              />
            </FixedPressable>
          </View>
        ) : (
          <View style={viewedRowStyles.pl3} />
        )}

        <View style={viewedRowStyles.contentCol}>
          <View style={viewedRowStyles.headerRow}>
            <View>
              <FixedPressable
                hitSlop={4}
                style={[viewedRowStyles.nodeTag, styles.layer2]}
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
            <Text style={[styles.text_meta, viewedRowStyles.dot]}>·</Text>
            <View style={viewedRowStyles.usernameWrap}>
              <FixedPressable
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
                  style={[
                    styles.text_desc,
                    styles.text_xs,
                    viewedRowStyles.usernameText,
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
                props.titleStyle === 'emphasized' &&
                  viewedRowStyles.titleEmphasized,
              ]}
            >
              {title}
            </Text>
            <View style={viewedRowStyles.metaRow}>
              <Text
                style={[viewedRowStyles.mr2, styles.text_meta, styles.text_xs]}
              >
                上次查看
              </Text>
              <Text style={[styles.text_meta, styles.text_xs]}>
                <TimeAgo date={data.viewed_at} />
              </Text>
            </View>
          </View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}

const viewedRowStyles = StyleSheet.create({
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCol: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  pl3: {
    paddingLeft: 12,
  },
  contentCol: {
    flex: 1,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 4,
  },
  nodeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  dot: {
    marginHorizontal: 4,
  },
  usernameWrap: {
    position: 'relative',
    top: 1,
  },
  usernameText: {
    fontWeight: '600',
  },
  titleEmphasized: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr2: {
    marginRight: 8,
  },
})

export default ViewedTopicRow
