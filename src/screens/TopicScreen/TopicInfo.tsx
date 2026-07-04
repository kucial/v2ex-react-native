import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import HtmlRender from '@/components/HtmlRender'
import { BlockText, Box } from '@/components/Skeleton/Elements'

import { useTheme } from '@/containers/ThemeService'
import { TopicDetail } from '@/utils/v2ex-client/types'

function TopicInfo(props: { data: TopicDetail; contentWidth: number }) {
  const { data: topic, contentWidth } = props
  const { member, node } = topic
  const { styles, colorScheme } = useTheme()

  const router = useRouter()

  return (
    <>
      <View style={topicInfoStyles.headerRow}>
        {member && (
          <View style={topicInfoStyles.memberRow}>
            <Pressable
              hitSlop={4}
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: member.username,
                  },
                })
              }}
            >
              {member.avatar_large ? (
                <Image
                  source={{
                    uri: member.avatar_large,
                  }}
                  priority='low'
                  style={topicInfoStyles.avatar}
                />
              ) : (
                <Box style={topicInfoStyles.avatar} />
              )}
            </Pressable>
            <View style={topicInfoStyles.memberMetaWrap}>
              <View style={topicInfoStyles.py05}>
                <Pressable
                  hitSlop={4}
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
                      topicInfoStyles.medium,
                      styles.text_meta,
                      styles.text_xs,
                    ]}
                  >
                    {member.username}
                  </Text>
                </Pressable>
              </View>
              <View style={topicInfoStyles.ml2}>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {topic.created_time}
                </Text>
              </View>
            </View>
          </View>
        )}
        <View>
          {node && (
            <Pressable
              style={({ pressed }) => [
                topicInfoStyles.nodeBtn,
                styles.layer2,
                pressed && topicInfoStyles.pressed50,
              ]}
              hitSlop={6}
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
              <Text style={styles.text_meta}>{node.title}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={[topicInfoStyles.titleWrap, styles.border_b]}>
        <Text
          selectable
          style={[topicInfoStyles.semibold, styles.text, styles.text_lg]}
        >
          {topic.title}
        </Text>
      </View>
      {!!topic.content_rendered && (
        <HtmlRender
          contentWidth={contentWidth}
          baseStyle={{
            fontSize: styles.text_base.fontSize,
          }}
          source={{
            html: topic.content_rendered,
            baseUrl: 'https://v2ex.com',
          }}
        />
      )}
      {topic.content_rendered === undefined && <BlockText lines={5} />}
      {!!topic.subtles?.length && (
        <View style={topicInfoStyles.mt2}>
          {topic.subtles.map((subtle, index) => (
            <View
              style={[
                topicInfoStyles.subtleBox,
                styles.border_t_light,
                styles.highlight,
              ]}
              key={index}
            >
              <View style={topicInfoStyles.mb1}>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {subtle.meta}
                </Text>
              </View>
              <HtmlRender
                contentWidth={contentWidth}
                baseStyle={{
                  fontSize: styles.text_base.fontSize,
                }}
                source={{
                  html: subtle.content_rendered,
                  baseUrl: 'https://v2ex.com',
                }}
              />
            </View>
          ))}
        </View>
      )}
    </>
  )
}

const topicInfoStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  memberMetaWrap: {
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  py05: {
    paddingVertical: 2,
  },
  medium: {
    fontWeight: '500',
  },
  ml2: {
    marginLeft: 8,
  },
  nodeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  pressed50: {
    opacity: 0.5,
  },
  titleWrap: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  semibold: {
    fontWeight: '600',
  },
  mt2: {
    marginTop: 8,
  },
  subtleBox: {
    marginHorizontal: -8,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  mb1: {
    marginBottom: 4,
  },
})

export default memo(TopicInfo)
