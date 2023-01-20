import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import useSWR, { useSWRConfig } from 'swr'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import HtmlRender from '@/components/HtmlRender'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'

import NodeTopicList from '@/components/NodeTopicList'

import * as v2exClient from '@/utils/v2ex-client'
import { NodeDetail } from '@/types/v2ex'

type NodeBrief = {
  name: string
} & Partial<NodeDetail>

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'node'>
export default function NodeScreen({ route, navigation }: ScreenProps) {
  const { name, brief } = route.params
  const { styles } = useTheme()
  const [collecting, setCollecting] = useState(false)
  const { mutate } = useSWRConfig()

  const { width } = useWindowDimensions()
  const aIndicator = useActivityIndicator()
  const alert = useAlertService()
  const { composeAuthedNavigation } = useAuthService()

  const nodeSwr = useSWR(
    [`/page/go/:name/node.json`, name],
    ([_, name]) => v2exClient.getNodeDetail({ name }),
    {
      shouldRetryOnError: false,
      onError(err) {
        alert.alertWithType('error', '错误', err.message || '请求资源失败')
      },
    },
  )
  // const collectMutation = useSWRMutation(
  //   [`/page/go/:name/node.json`, name],
  //   async ([_, name]) => v2exClient.collectNode({ name }),
  //   {
  //     optimisticData: (current) => ({
  //       ...current,
  //       data: {
  //         ...current.data,
  //         collected: true,
  //       },
  //     })
  //   }
  // )
  // const uncollectMutation = useSWRMutation(
  //   [`/page/go/:name/node.json`, name],
  //   async ([_, name]) => v2exClient.uncollectNode({ name }),
  //   {
  //     optimisticData: (current) => ({
  //       ...current,
  //       data: {
  //         ...current.data,
  //         collected: true,
  //       },
  //     })
  //   }
  // )

  const node = nodeSwr.data?.data || (brief as NodeBrief) || ({} as NodeBrief)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: node?.title,
    })
  }, [node?.title])

  const htmlProps = useMemo(() => {
    return {
      source: { html: node.header, baseUrl: 'https://v2ex.com' },
      baseStyle: {
        fontSize: 14,
      },
    }
  }, [node])

  const header = (
    <View className="mb-3 p-2" style={styles.layer1}>
      <View className="rounded-lg">
        <View className="flex flex-row">
          {node.avatar_large ? (
            <FastImage
              className="w-[60px] h-[60px] mr-3"
              source={{
                uri: node.avatar_large,
              }}></FastImage>
          ) : (
            <View
              className="w-[60px] h-[60px] mr-3"
              style={styles.layer3}></View>
          )}

          <View className="flex-1">
            <View className="flex flex-row justify-between items-center mb-[6px]">
              <View>
                <Text className="text-lg font-semibold" style={styles.text}>
                  {node.title}
                </Text>
              </View>
              <View className="flex flex-row pr-2">
                <Text className="text-sm mr-1" style={styles.text_meta}>
                  主题总数
                </Text>
                <Text className="text-sm font-medium" style={styles.text_meta}>
                  {node.topics || '--'}
                </Text>
              </View>
            </View>
            <View>
              {!!node.header && (
                <HtmlRender contentWidth={width - 100} {...htmlProps} />
              )}
            </View>
            <View className="flex flex-row mt-3 mb-2 justify-end mr-1">
              <Pressable
                className={classNames(
                  'h-[38px] rounded-lg px-3 items-center justify-center active:opacity-60',
                  {
                    'opacity-60': collecting,
                  },
                )}
                style={[styles.border, styles.border_light]}
                disabled={collecting || node.collected === undefined}
                onPress={composeAuthedNavigation(() => {
                  const KEY = `node-collect-toggle:${name}`
                  const request = node.collected
                    ? v2exClient.uncollectNode
                    : v2exClient.collectNode
                  aIndicator.show(KEY)
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
                      alert.alertWithType('error', '错误', err.message)
                    })
                    .finally(() => {
                      aIndicator.hide(KEY)
                      setCollecting(false)
                    })
                })}>
                <Text style={styles.text}>
                  {node.collected ? '取消收藏' : '加入收藏'}
                </Text>
              </Pressable>
              <Pressable
                className={classNames(
                  'ml-2 h-[38px] rounded-lg px-3 items-center justify-center active:opacity-60',
                )}
                style={[styles.border, styles.border_light]}
                onPress={composeAuthedNavigation(() => {
                  navigation.push('new-topic', {
                    node: {
                      name: node.name,
                    },
                  })
                })}>
                <Text style={styles.text}>创建新主题</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  )

  return <NodeTopicList header={header} name={name} isFocused />
}

NodeScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string,
      brief: PropTypes.object,
    }),
  }),
  navigation: PropTypes.shape({
    setOptions: PropTypes.func,
    push: PropTypes.func,
  }),
}