import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'

import { DemoRowProps } from './types'

const NormalTopicRowDemo = (props: DemoRowProps) => {
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember, viewedStatus, isLast } = props
  const { styles } = useTheme()
  return (
    <View
      style={[normalDemoStyles.row, styles.layer1, !isLast && styles.border_b_light]}
    >
      {showAvatar ? (
        <View style={normalDemoStyles.avatarWrap}>
          <Image
            recyclingKey={`user-avatar:${member.username}`}
            source={{
              uri: member.avatar_normal,
            }}
            style={normalDemoStyles.avatar}
          />
        </View>
      ) : (
        <View style={normalDemoStyles.noAvatarPlaceholder}></View>
      )}
      <View
        style={[
          normalDemoStyles.contentCol,
          viewedStatus === 'viewed' && normalDemoStyles.opacity70,
        ]}
      >
        <View style={normalDemoStyles.metaRow}>
          <View>
            <View
              style={[normalDemoStyles.nodeTag, styles.layer2]}
            >
              <Text style={[styles.text_desc, styles.text_xs]}>
                {node.title}
              </Text>
            </View>
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View style={normalDemoStyles.usernameWrap}>
            <Text
              style={[
                normalDemoStyles.font600,
                styles.text_desc,
                styles.text_xs,
              ]}
            >
              {member.username}
            </Text>
          </View>
        </View>
        <View>
          <Text
            style={[
              props.titleStyle === 'emphasized' && normalDemoStyles.font500,
              styles.text,
              styles.text_base,
            ]}
          >
            {title}
          </Text>
          <View style={normalDemoStyles.footerRow}>
            <Text style={[styles.text_meta, styles.text_xs]}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text
                  style={[
                    normalDemoStyles.px2,
                    styles.text_meta,
                    styles.text_xs,
                  ]}
                >
                  •
                </Text>
                <View style={normalDemoStyles.replyMemberRow}>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    最后回复来自
                  </Text>
                  <View style={normalDemoStyles.replyByWrap}>
                    <Text
                      style={[
                        normalDemoStyles.font600,
                        styles.text_desc,
                        styles.text_xs,
                      ]}
                    >
                      {last_reply_by}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View style={normalDemoStyles.repliesCol}>
        {!!replies && (
          <View style={[normalDemoStyles.tagBg, styles.tag__bg]}>
            <Text style={styles.tag__text}>{replies}</Text>
          </View>
        )}
      </View>
      {viewedStatus === 'has_update' && (
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
    </View>
  )
}

const normalDemoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  noAvatarPlaceholder: {
    paddingLeft: 12,
  },
  contentCol: {
    flex: 1,
    paddingVertical: 8,
  },
  opacity70: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    columnGap: 4,
    marginBottom: 4,
  },
  nodeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  usernameWrap: {
    position: 'relative',
    top: 1,
  },
  font600: {
    fontWeight: '600',
  },
  font500: {
    fontWeight: '500',
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  px2: {
    paddingHorizontal: 8,
  },
  replyMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyByWrap: {
    paddingHorizontal: 4,
  },
  repliesCol: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  tagBg: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
})

export default NormalTopicRowDemo
