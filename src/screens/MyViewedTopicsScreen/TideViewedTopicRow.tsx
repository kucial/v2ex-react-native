import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'

import { useTheme } from '@/containers/ThemeService'

const TideViewedTopicRow = (props: ViewedTopicRowProps) => {
  const { data, showAvatar, isLast } = props
  const router = useRouter()
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <FixedPressable
      sentry-label='TideTopicRow'
      style={[tideViewedStyles.pressable, !isLast && styles.border_b_light]}
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
        <View style={tideViewedStyles.avatarCol}>
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
              style={tideViewedStyles.avatar}
            />
          </FixedPressable>
        </View>
      ) : (
        <View style={tideViewedStyles.pl3} />
      )}
      <View style={tideViewedStyles.contentCol}>
        <Text
          style={[
            styles.text,
            styles.text_base,
            props.titleStyle === 'emphasized' &&
              tideViewedStyles.titleEmphasized,
          ]}
        >
          {title}
        </Text>
        <View style={tideViewedStyles.metaRow}>
          <FixedPressable
            hitSlop={4}
            style={[tideViewedStyles.nodeTag, styles.layer2]}
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
            <Text style={[styles.text_desc, styles.text_xs]}>{node.title}</Text>
          </FixedPressable>
          <Text
            style={[tideViewedStyles.mr2, styles.text_meta, styles.text_xs]}
          >
            上次查看
          </Text>
          <Text style={[styles.text_meta, styles.text_xs]}>
            <TimeAgo date={data.viewed_at} />
          </Text>
        </View>
      </View>
    </FixedPressable>
  )
}

const tideViewedStyles = StyleSheet.create({
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
    paddingTop: 4,
    paddingBottom: 8,
  },
  titleEmphasized: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  nodeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    borderRadius: 4,
  },
  mr2: {
    marginRight: 8,
  },
})

export default TideViewedTopicRow
