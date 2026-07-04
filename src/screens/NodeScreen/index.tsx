import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'

import AnimatedHeader from '@/components/AnimatedHeader'
import Button from '@/components/Button'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NodeTopicList from '@/components/NodeTopicList'

import { useAlertService } from '@/containers/AlertService'
import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'
import { getAbsoluteUrl } from '@/utils/url'
import { collectNode, getNodeDetail, uncollectNode } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

type NodeBrief = {
  name: string
} & Partial<NodeDetail>

export default function NodeScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const name = params.name as string
  const brief = null
  // TODO: handle brief
  const { styles, colorScheme } = useTheme()
  const [collecting, setCollecting] = useState(false)

  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)
  const alert = useAlertService()
  const composeAuthedNavigation = useComposeAuthedNavigation()
  const queryClient = useQueryClient()

  const fetchNode = useCallback(async () => {
    try {
      const res = await getNodeDetail({ name })
      return res.data
    } catch (err) {
      if (err.code !== '2FA_ENABLED') {
        alert.show({
          type: 'error',
          message: err.message || '请求资源失败',
        })
      }
    }
  }, [name, alert])

  const nodeQuery = useQuery({
    queryKey: [`/page/go/:name/node.json`, name],
    queryFn: fetchNode,
  })

  const node = nodeQuery.data || (brief as NodeBrief) || ({} as NodeBrief)

  const htmlProps = useMemo(() => {
    return {
      source: { html: node.header, baseUrl: 'https://v2ex.com' },
      baseStyle: {
        fontSize: styles.text_sm.fontSize,
      },
    }
  }, [node, styles])

  const handleCollectToggle = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        const request = node.collected ? uncollectNode : collectNode
        const indicator = alert.show({
          type: 'default',
          message: '处理中',
          loading: true,
          duration: 0,
        })
        setCollecting(true)
        request({
          name,
        })
          .then(({ data: patch, message }) => {
            queryClient.setQueryData([`/page/go/:name/node.json`, name], {
              ...node,
              ...patch,
            })
            queryClient.invalidateQueries({
              queryKey: ['/page/my/nodes.json'],
            })
            alert.show({ type: 'success', message })
          })
          .catch((err) => {
            if (err.code == 'OPERATION_FAILED') {
              nodeQuery.refetch()
            }
            alert.show({ type: 'error', message: err.message })
          })
          .finally(() => {
            alert.hide(indicator)
            setCollecting(false)
          })
      }, [node, alert, name, queryClient, nodeQuery]),
    ),
    {
      message: '[NodeScreen] `Collect` button pressed',
    },
  )

  const handleCreateNewTopic = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        if (node) {
          router.push({
            pathname: '/new-topic',
            params: {
              node: node?.name,
            },
          })
        }
      }, [node, router]),
    ),
    {
      message: '[NodeScreen] `New topic` button pressed',
    },
  )

  const header = (
    <MaxWidthWrapper style={styles.layer1}>
      <View style={[nodeScreenStyles.headerContainer, styles.border_b_light]}>
        <View style={nodeScreenStyles.rounded}>
          <View style={nodeScreenStyles.row}>
            {node.avatar_large ? (
              <Image
                style={nodeScreenStyles.avatar}
                source={{
                  uri: getAbsoluteUrl(node.avatar_large),
                }}
              />
            ) : (
              <View style={[nodeScreenStyles.avatar, styles.layer3]} />
            )}

            <View style={nodeScreenStyles.flex1}>
              <View style={nodeScreenStyles.titleRow}>
                <View>
                  <Text
                    style={[
                      nodeScreenStyles.titleText,
                      styles.text,
                      styles.text_lg,
                    ]}
                  >
                    {node.title}
                  </Text>
                </View>
                <View style={nodeScreenStyles.countRow}>
                  <Text
                    style={[
                      nodeScreenStyles.countLabel,
                      styles.text_meta,
                      styles.text_sm,
                    ]}
                  >
                    主题总数
                  </Text>
                  <Text
                    style={[
                      nodeScreenStyles.countValue,
                      styles.text_meta,
                      styles.text_sm,
                    ]}
                  >
                    {node.topics || '--'}
                  </Text>
                </View>
              </View>
              <View>
                {!!node.header && (
                  <HtmlRender
                    key={node.header + colorScheme}
                    contentWidth={CONTAINER_WIDTH - 100}
                    {...htmlProps}
                  />
                )}
              </View>
              <View style={nodeScreenStyles.btnRow}>
                <Button
                  variant='default'
                  size='sm'
                  style={nodeScreenStyles.mr2}
                  disabled={collecting || node.collected === undefined}
                  onPress={handleCollectToggle}
                  label={node.collected ? '取消收藏' : '加入收藏'}
                />
                <Button
                  variant='default'
                  size='sm'
                  disabled={!nodeQuery.data}
                  onPress={handleCreateNewTopic}
                  label='创建新主题'
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </MaxWidthWrapper>
  )

  const scrollY = useSharedValue(0)

  return (
    <View style={{ flex: 1 }}>
      <AnimatedHeader title={node?.title} scrollY={scrollY} />
      <NodeTopicList
        header={header}
        name={name as string}
        isFocused
        scrollY={scrollY}
      />
    </View>
  )
}

const nodeScreenStyles = StyleSheet.create({
  headerContainer: {
    padding: 8,
  },
  rounded: {
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  flex1: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleText: {
    fontWeight: '600',
  },
  countRow: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  countLabel: {
    marginRight: 4,
  },
  countValue: {
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    justifyContent: 'flex-end',
    marginRight: 4,
  },
  mr2: {
    marginRight: 8,
  },
})
