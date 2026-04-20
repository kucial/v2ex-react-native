import { useCallback, useMemo, useState } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
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
  }, [name])

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
      }, [node]),
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
      }, [node?.name]),
    ),
    {
      message: '[NodeScreen] `New topic` button pressed',
    },
  )

  const header = (
    <MaxWidthWrapper style={styles.layer1}>
      <View className='p-2' style={[styles.border_b_light]}>
        <View className='rounded-lg'>
          <View className='flex flex-row'>
            {node.avatar_large ? (
              <Image
                className='w-[60px] h-[60px] mr-3'
                source={{
                  uri: getAbsoluteUrl(node.avatar_large),
                }}
              ></Image>
            ) : (
              <View
                className='w-[60px] h-[60px] mr-3'
                style={styles.layer3}
              ></View>
            )}

            <View className='flex-1'>
              <View className='flex flex-row justify-between items-center mb-[6px]'>
                <View>
                  <Text
                    className='font-semibold'
                    style={[styles.text, styles.text_lg]}
                  >
                    {node.title}
                  </Text>
                </View>
                <View className='flex flex-row pr-2'>
                  <Text
                    className='mr-1'
                    style={[styles.text_meta, styles.text_sm]}
                  >
                    主题总数
                  </Text>
                  <Text
                    className='font-medium'
                    style={[styles.text_meta, styles.text_sm]}
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
              <View className='flex flex-row mt-3 mb-2 justify-end mr-1'>
                <Button
                  variant='default'
                  size='sm'
                  className='mr-2'
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
