import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import useSWR, { useSWRConfig } from 'swr'

import HtmlRender from '@/components/HtmlRender'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import fetcher from '@/utils/fetcher'

import NodeTopicList from './NodeTopicList'

export default function NodeScreen({ route, navigation }) {
  const { name, brief } = route.params
  const { styles } = useTheme()
  const [collecting, setCollecting] = useState(false)
  const { mutate } = useSWRConfig()

  const { width } = useWindowDimensions()
  const aIndicator = useActivityIndicator()
  const alert = useAlertService()
  const { composeAuthedNavigation } = useAuthService()

  const nodeSwr = useSWR(`/api/nodes/show.json?name=${name}`, {
    shouldRetryOnError: false,
    onError(err) {
      alert.alertWithType('error', '错误', err.message || '请求资源失败')
    },
  })
  const getKey = useCallback(
    (index) => {
      return `/page/go/${name}/feed.json?p=${index + 1}`
    },
    [name],
  )

  const node = nodeSwr.data || brief || {}
  useLayoutEffect(() => {
    navigation.setOptions({
      title: node.title,
    })
  }, [node.title])

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
                  const endpoint = node.collected
                    ? `/page/go/${name}/uncollect.json`
                    : `/page/go/${name}/collect.json`
                  aIndicator.show()
                  setCollecting(true)
                  fetcher(endpoint)
                    .then((result) => {
                      nodeSwr.mutate((data) => ({
                        ...data,
                        ...result,
                      }))
                      mutate('/page/my/nodes.json')
                    })
                    .catch((err) => {
                      alert.alertWithType('error', '错误', err.message)
                    })
                    .finally(() => {
                      aIndicator.hide()
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
                    node,
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

  return (
    <NodeTopicList
      header={header}
      nodeSwr={nodeSwr}
      getKey={getKey}
      isFocused
    />
  )
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
