import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import TriangleCorner from '@/components/TriangleCorner'

import { useTheme } from '@/containers/ThemeService'

import { DemoRowProps } from './types'

const TideTopicRowDemo = (props: DemoRowProps) => {
  const { styles } = useTheme()
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember, viewedStatus } = props
  return (
    <View
      style={[tideDemoStyles.row, styles.layer1, styles.border_b_light]}
    >
      {showAvatar ? (
        <View style={tideDemoStyles.avatarWrap}>
          <Image
            recyclingKey={`user-avatar:${member.username}`}
            source={{
              uri: member.avatar_normal,
            }}
            style={tideDemoStyles.avatar}
          />
        </View>
      ) : (
        <View style={tideDemoStyles.noAvatarPlaceholder}></View>
      )}

      <View
        style={[
          tideDemoStyles.contentCol,
          viewedStatus === 'viewed' && tideDemoStyles.opacity70,
        ]}
      >
        <View>
          <Text
            style={[
              props.titleStyle === 'emphasized' && tideDemoStyles.font500,
              styles.text,
              styles.text_base,
            ]}
          >
            {title}
          </Text>
          <View style={tideDemoStyles.metaRow}>
            <View
              style={[tideDemoStyles.nodeTag, styles.layer2]}
            >
              <Text style={[styles.text_desc, styles.text_xs]}>
                {node.title}
              </Text>
            </View>
            <Text style={[styles.text_meta, styles.text_xs]}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text
                  style={[
                    tideDemoStyles.px1,
                    styles.text_meta,
                    styles.text_xs,
                  ]}
                >
                  •
                </Text>
                <View style={tideDemoStyles.replyMemberRow}>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    最后回复来自
                  </Text>
                  <View style={tideDemoStyles.replyByWrap}>
                    <Text
                      style={[
                        tideDemoStyles.font600,
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
      <View style={tideDemoStyles.repliesCol}>
        <View style={[tideDemoStyles.tagBg, styles.tag__bg]}>
          <Text style={[styles.tag__text, styles.text_xs]}>{replies}</Text>
        </View>
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

const tideDemoStyles = StyleSheet.create({
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
    paddingTop: 4,
    paddingBottom: 8,
  },
  opacity70: {
    opacity: 0.7,
  },
  font500: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
  },
  px1: {
    paddingHorizontal: 4,
  },
  replyMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyByWrap: {
    paddingHorizontal: 4,
  },
  font600: {
    fontWeight: '600',
  },
  repliesCol: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 4,
    paddingRight: 8,
  },
  tagBg: {
    borderRadius: 9999,
    paddingHorizontal: 4,
  },
})

export default TideTopicRowDemo
