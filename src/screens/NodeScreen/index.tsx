import { useCallback, useMemo, useState } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import useSWR, { useSWRConfig } from 'swr'

import AnimatedHeader from '@/components/AnimatedHeader'
import Button from '@/components/Button'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NodeTopicList from '@/components/NodeTopicList'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'
import * as v2exClient from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

type NodeBrief = {
  name: string
} & Partial<NodeDetail>

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'node'>
export default function NodeScreen({ route, navigation }: ScreenProps) {
  const { name, brief } = route.params
  const { styles, colorScheme } = useTheme()
  const [collecting, setCollecting] = useState(false)
  const { mutate } = useSWRConfig()

  const { width } = useWindowDimensions()
  const {
    data: { maxContainerWidth },
  } = useAppSettings()
  const CONTAINER_WIDTH = Math.min(width, maxContainerWidth)
  const alert = useAlertService()
  const { composeAuthedNavigation } = useAuthService()

  const nodeSwr = useSWR(
    [`/page/go/:name/node.json`, name],
    ([_, name]) => v2exClient.getNodeDetail({ name }),
    {
      shouldRetryOnError: false,
      onError(err) {
        if (err.code === '2FA_ENABLED') {
          return
        }
        alert.show({
          type: 'error',
          message: err.message || '请求资源失败',
        })
      },
    },
  )

  const node = nodeSwr.data?.data || (brief as NodeBrief) || ({} as NodeBrief)

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
        const request = node.collected
          ? v2exClient.uncollectNode
          : v2exClient.collectNode
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
          .then(({ data: patch }) => {
            nodeSwr.mutate((data) => ({
              ...data,
              ...patch,
            }))
            mutate('/page/my/nodes.json')
          })
          .catch((err) => {
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
        navigation.push('new-topic', {
          node: node as NodeDetail,
        })
      }, [node?.name]),
    ),
    {
      message: '[NodeScreen] `New topic` button pressed',
    },
  )

  const header = (
    <MaxWidthWrapper style={styles.layer1}>
      <View className="p-2" style={[styles.border_b_light]}>
        <View className="rounded-lg">
          <View className="flex flex-row">
            {node.avatar_large ? (
              <Image
                className="w-[60px] h-[60px] mr-3"
                source={{
                  uri: node.avatar_large,
                }}></Image>
            ) : (
              <View
                className="w-[60px] h-[60px] mr-3"
                style={styles.layer3}></View>
            )}

            <View className="flex-1">
              <View className="flex flex-row justify-between items-center mb-[6px]">
                <View>
                  <Text
                    className="font-semibold"
                    style={[styles.text, styles.text_lg]}>
                    {node.title}
                  </Text>
                </View>
                <View className="flex flex-row pr-2">
                  <Text
                    className="mr-1"
                    style={[styles.text_meta, styles.text_sm]}>
                    主题总数
                  </Text>
                  <Text
                    className="font-medium"
                    style={[styles.text_meta, styles.text_sm]}>
                    {node.topics || '--'}
                  </Text>
                </View>
              </View>
              <View>
                {!!node.header && (
                  <HtmlRender
                    key={node.header + colorScheme}
                    navigation={navigation}
                    contentWidth={CONTAINER_WIDTH - 100}
                    {...htmlProps}
                  />
                )}
              </View>
              <View className="flex flex-row mt-3 mb-2 justify-end mr-1">
                <Button
                  variant="default"
                  size="sm"
                  className="mr-2"
                  disabled={collecting || node.collected === undefined}
                  onPress={handleCollectToggle}
                  label={node.collected ? '取消收藏' : '加入收藏'}
                />
                <Button
                  variant="default"
                  size="sm"
                  disabled={!nodeSwr.data}
                  onPress={handleCreateNewTopic}
                  label="创建新主题"
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
      <NodeTopicList header={header} name={name} isFocused scrollY={scrollY} />
    </View>
  )
}
