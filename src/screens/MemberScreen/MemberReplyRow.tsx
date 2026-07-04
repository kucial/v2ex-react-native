import { memo, useMemo } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'

import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

const MemberReplyRow = (props: RepliedFeedRowProps) => {
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)
  const router = useRouter()

  const { data, isLast } = props
  const { styles } = useTheme()
  const htmlSource = useMemo(
    () => ({
      html: data?.reply_content_rendered,
      baseUrl: 'https://v2ex.com',
    }),
    [data?.reply_content_rendered],
  )
  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={!isLast && styles.border_b_light}>
          <View style={rowStyles.container}>
            <View style={[rowStyles.skeletonBox, styles.layer2]}>
              <InlineText style={styles.text_xs} width='80%'></InlineText>
              <BlockText lines={[1, 2]} />
            </View>
          </View>
          <View style={rowStyles.skeletonContent}>
            <BlockText lines={[1, 4]} />
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <View style={!isLast && styles.border_b_light}>
        <View style={rowStyles.container}>
          <View style={[rowStyles.headerBox, styles.layer2]}>
            <View style={rowStyles.row}>
              <View style={rowStyles.flex1}>
                <Text
                  style={[styles.text_meta, styles.text_xs]}
                >{`回复了${data.member?.username} 创建的主题 › `}</Text>
              </View>
              <Text style={[styles.text_meta, styles.text_xs]}>
                {data.reply_time}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => pressed && rowStyles.pressed}
              onPress={() => {
                router.push({
                  pathname: '/topic/[id]',
                  params: {
                    id: data.id,
                  },
                })
              }}
            >
              <Text style={[styles.text, rowStyles.titleText]}>
                {data.title}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={rowStyles.contentBox}>
          <HtmlRender source={htmlSource} contentWidth={CONTAINER_WIDTH - 24} />
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
  container: {
    padding: 4,
  },
  skeletonBox: {
    padding: 4,
    borderRadius: 2,
  },
  skeletonContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBox: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  titleText: {
    marginVertical: 4,
  },
  contentBox: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.6,
  },
})

export default memo(MemberReplyRow)
