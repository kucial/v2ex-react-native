import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NodeLabel from '@/components/NodeLabel'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
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
        style={({ pressed }) => [
          resultRowStyles.row,
          styles.layer1,
          styles.border_b_light,
          pressed && resultRowStyles.pressed,
        ]}
        onPress={() => {
          router.push({
            pathname: '/topic/[id]',
            params: {
              id: _source.id,
            },
          })
        }}
      >
        <View style={resultRowStyles.pl3} />
        <View style={resultRowStyles.mainCol}>
          <View>
            <Text
              style={[resultRowStyles.titleText, styles.text, styles.text_base]}
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
          <View style={resultRowStyles.metaRow}>
            <View style={[resultRowStyles.nodeBadge, styles.layer2]}>
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
            <View style={resultRowStyles.rel}>
              <FixedPressable
                style={({ pressed }) => [
                  pressed && resultRowStyles.pressed60,
                ]}
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
                  style={[
                    resultRowStyles.memberText,
                    styles.text_desc,
                    styles.text_xs,
                  ]}
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

const resultRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  pl3: {
    paddingLeft: 12,
  },
  mainCol: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
  },
  titleText: {
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  nodeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  rel: {
    position: 'relative',
  },
  pressed60: {
    opacity: 0.6,
  },
  memberText: {
    fontWeight: '600',
  },
})
