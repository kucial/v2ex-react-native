import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, Box } from '@/components/Skeleton/Elements'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { Notification } from '@/utils/v2ex-client/types'

const htmlBaseStyle = {
  lineHeight: 18,
}

const NotificationRow = (props: { data: Notification }) => {
  const { data } = props
  const router = useRouter()
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)
  const { styles } = useTheme()
  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.row, styles.layer1, styles.border_b_light]}>
          <View style={rowStyles.mr2}>
            <Box style={rowStyles.avatarBox} />
          </View>
          <View style={rowStyles.flex1}>
            <View style={rowStyles.rowNoPad}>
              <BlockText lines={2} style={rowStyles.leading5} />
            </View>
            <View style={[rowStyles.contentBox, styles.layer2]}>
              <BlockText
                lines={[1, 3]}
                style={{
                  lineHeight: 20,
                }}
              />
            </View>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  let header
  switch (data.action) {
    case 'collect':
      header = (
        <View style={rowStyles.rowNoPad}>
          <Text style={[styles.text_meta, rowStyles.leading5]}>
            <Text
              style={[styles.text_desc, rowStyles.fontMedium]}
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: data.member.username,
                  },
                })
              }}
            >
              {data.member.username}
            </Text>
            <Text>{' 收藏了你发布的主题 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                router.push({
                  pathname: '/topic/[id]',
                  params: {
                    id: data.topic.id,
                  },
                })
              }}
            >
              {data.topic.title}
            </Text>
            <Text style={rowStyles.px2}>{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'thank':
      header = (
        <View style={rowStyles.rowNoPad}>
          <Text style={[styles.text_meta, rowStyles.leading5]}>
            <Text
              style={[styles.text_desc, rowStyles.fontMedium]}
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: data.member.username,
                  },
                })
              }}
            >
              {data.member.username}
            </Text>
            <Text>{' 感谢了你发布的主题 '}</Text>
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/topic/[id]',
                  params: {
                    id: data.topic.id,
                  },
                })
              }}
            >
              <Text style={[{ paddingHorizontal: 8 }, styles.text_desc]}>
                {data.topic.title}
              </Text>
            </Pressable>
            <Text style={rowStyles.px2}>{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'thank_reply':
      header = (
        <View style={rowStyles.rowNoPad}>
          <Text style={[styles.text_meta, rowStyles.leading5]}>
            <Text
              style={[styles.text_desc, rowStyles.fontMedium]}
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: data.member.username,
                  },
                })
              }}
            >
              {data.member.username}
            </Text>
            <Text>{' 感谢了你在主题 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                router.push({
                  pathname: '/topic/[id]',
                  params: {
                    id: data.topic.id,
                  },
                })
              }}
            >
              {data.topic.title}
            </Text>
            <Text>{' 的回复'}</Text>
            <Text>{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'reply':
    default:
      header = (
        <View style={rowStyles.rowNoPad}>
          <Text style={[styles.text_meta, rowStyles.leading5]}>
            <Text
              style={[styles.text_desc, rowStyles.fontMedium]}
              onPress={() => {
                router.push({
                  pathname: '/member/[username]',
                  params: {
                    username: data.member.username,
                  },
                })
              }}
            >
              {data.member.username}
            </Text>
            <Text>{' 在 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                router.push({
                  pathname: '/topic/[id]',
                  params: {
                    id: data.topic.id,
                  },
                })
              }}
            >
              {data.topic.title}
            </Text>
            <Text>{' 里回复了你'}</Text>
            <Text style={styles.text_sm}>{data.time}</Text>
          </Text>
        </View>
      )
  }

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <View
        sentry-label='NotificationRow'
        style={[rowStyles.row, styles.border_b_light]}
      >
        <View style={rowStyles.mr2}>
          <Pressable
            hitSlop={4}
            style={({ pressed }) => pressed && rowStyles.pressed60}
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
              source={{
                uri: data.member.avatar_normal,
              }}
              style={rowStyles.avatarImage}
            />
          </Pressable>
        </View>
        <View style={rowStyles.flex1}>
          {header}
          {data.content_rendered && (
            <View style={[rowStyles.contentBox, styles.layer2]}>
              <HtmlRender
                key={data.content_rendered}
                contentWidth={CONTAINER_WIDTH - 24 - 8 - 8 - 8}
                source={{
                  html: data.content_rendered,
                  baseUrl: 'https://v2ex.com',
                }}
                baseStyle={htmlBaseStyle}
              />
            </View>
          )}
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
  },
  mr2: {
    marginRight: 8,
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  flex1: {
    flex: 1,
  },
  rowNoPad: {
    flexDirection: 'row',
  },
  leading5: {
    lineHeight: 20,
  },
  contentBox: {
    marginTop: 4,
    padding: 4,
    borderRadius: 4,
  },
  fontMedium: {
    fontWeight: '500',
  },
  px2: {
    paddingHorizontal: 8,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default NotificationRow
