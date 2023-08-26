import { Text, useWindowDimensions, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NodeLabel from '@/components/NodeLabel'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { localTime } from '@/utils/time'
import { SearchHit } from '@/utils/v2ex-client/types'

export default function ResultRow(props: { data: SearchHit }) {
  const { width } = useWindowDimensions()
  const {
    data: { maxContainerWidth },
  } = useAppSettings()
  const CONTAINER_WIDTH = Math.min(maxContainerWidth, width)

  const { styles } = useTheme()
  const { data } = props
  const { _source } = props.data

  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label="TopicRow"
        className={classNames(
          'flex flex-row items-center',
          'active:opacity-50',
        )}
        style={[styles.layer1, styles.border_b_light]}
        onPress={() => {
          navigation.push('topic', {
            id: _source.id,
            brief: {
              id: _source.id,
              title: _source.title,
            },
          })
        }}>
        <View className="pl-3"></View>
        <View className={classNames('flex-1 py-2 pr-3')}>
          <View>
            <Text
              className={classNames('text-base  leading-tight', 'font-[500]')}
              style={styles.text}>
              {_source.title}
            </Text>
          </View>
          <View>
            <HtmlRender
              navigation={navigation}
              source={{
                html: data.highlight.content?.[0] || data._source.content,
                baseUrl: 'https://v2ex.com',
              }}
              contentWidth={CONTAINER_WIDTH - 24}
              tagsStyles={{
                em: styles.text_primary,
              }}
            />
          </View>
          <View className="flex flex-row items-center space-x-1 py-1">
            <View className="py-[2px] px-1 rounded" style={styles.layer2}>
              <NodeLabel
                className="text-xs"
                style={styles.text_desc}
                id={_source.node}
              />
            </View>
            <View>
              <Text className="text-xs" style={styles.text_desc}>
                {localTime(_source.created)}
              </Text>
            </View>
            <Text style={styles.text_meta}>·</Text>
            <View className="relative">
              <FixedPressable
                className="active:opacity-60"
                hitSlop={5}
                onPress={() => {
                  navigation.navigate('member', {
                    username: _source.member,
                  })
                }}>
                <Text className="font-[600] text-xs" style={styles.text_desc}>
                  {_source.member}
                </Text>
              </FixedPressable>
            </View>
            <Text style={styles.text_meta}>·</Text>
            <View>
              <Text className="text-xs" style={styles.text_desc}>
                {_source.replies} 条回复
              </Text>
            </View>
          </View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}
