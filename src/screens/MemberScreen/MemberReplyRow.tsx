import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

const MemberReplyRow = (props: RepliedFeedRowProps) => {
  const { width } = useWindowDimensions()
  const {
    data: { maxContainerWidth },
  } = useAppSettings()
  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)

  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { data, isLast } = props
  const { styles, colorScheme } = useTheme()
  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={!isLast && styles.border_b_light}>
          <View className="p-1">
            <View className="px-1 pb-1 pt-1 rounded-sm" style={styles.layer2}>
              <InlineText className="text-xs" width="80%"></InlineText>
              <BlockText lines={[1, 2]} />
            </View>
          </View>
          <View className="py-1 px-2">
            <BlockText lines={[1, 4]} />
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <View style={!isLast && styles.border_b_light}>
        <View className="p-1">
          <View className="px-2 pb-1 pt-2" style={styles.layer2}>
            <View className="flex flex-row">
              <View className="flex-1">
                <Text
                  className="text-xs"
                  style={
                    styles.text_meta
                  }>{`回复了${data.member?.username} 创建的主题 › `}</Text>
              </View>
              <Text className="text-xs" style={styles.text_meta}>
                {data.reply_time}
              </Text>
            </View>
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                navigation.push('topic', {
                  id: data.id,
                })
              }}>
              <Text className="my-1" style={styles.text}>
                {data.title}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="pt-1 pb-2 px-3">
          <HtmlRender
            key={data.reply_content_rendered + colorScheme}
            navigation={navigation}
            contentWidth={CONTAINER_WIDTH - 24}
            source={{
              html: data.reply_content_rendered,
              baseUrl: 'https://v2ex.com',
            }}
          />
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

export default MemberReplyRow
