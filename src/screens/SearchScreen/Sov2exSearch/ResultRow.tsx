import { Text, useWindowDimensions, View } from 'react-native'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NodeLabel from '@/components/NodeLabel'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { localTime } from '@/utils/time'
import { SearchHit } from '@/utils/v2ex-client/types'

export default function ResultRow(props: { data: SearchHit }) {
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(maxContainerWidth, width)

  const { styles } = useTheme()
  const { data } = props
  const { _source } = props.data

  const router = useRouter()

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TopicRow'
        className={cn('flex flex-row items-center', 'active:opacity-50')}
        style={[styles.layer1, styles.border_b_light]}
        onPress={() => {
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: _source.id,
            },
          })
        }}
      >
        <View className='pl-3'></View>
        <View className={cn('flex-1 py-2 pr-3')}>
          <View>
            <Text
              className={cn('font-[500]')}
              style={[styles.text, styles.text_base]}
            >
              {_source.title}
            </Text>
          </View>
          <View>
            <HtmlRender
              source={{
                html: data.highlight?.content?.[0] || data._source.content,
                baseUrl: 'https://v2ex.com',
              }}
              contentWidth={CONTAINER_WIDTH - 24}
              tagsStyles={{
                em: styles.text_primary,
              }}
            />
          </View>
          <View className='flex flex-row items-center space-x-1 py-1'>
            <View className='py-[2px] px-1 rounded' style={styles.layer2}>
              <NodeLabel
                style={[styles.text_desc, styles.text_xs]}
                id={_source.node}
              />
            </View>
            <View>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {localTime(_source.created)}
              </Text>
            </View>
            <Text style={styles.text_meta}>·</Text>
            <View className='relative'>
              <FixedPressable
                className='active:opacity-60'
                hitSlop={5}
                onPress={() => {
                  router.push({
                    pathname: '/member/[username]',
                    params: {
                      username: _source.member,
                    },
                  })
                }}
              >
                <Text
                  className='font-[600]'
                  style={[styles.text_desc, styles.text_xs]}
                >
                  {_source.member}
                </Text>
              </FixedPressable>
            </View>
            <Text style={styles.text_meta}>·</Text>
            <View>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {_source.replies} 条回复
              </Text>
            </View>
          </View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}
