import { Text, useWindowDimensions, View } from 'react-native'

import AppBrandIcon from '@/components/AppBrandIcon'
import Button from '@/components/Button'
import Loader from '@/components/Loader'

import { useTheme } from '../ThemeService'
import { PrepareStatus } from './type'

// Splash Screen 原始设计稿， Icon 宽度.
const INITIAL_LOGO_WIDTH = 333

export default function Status(props: {
  status: PrepareStatus
  error?: Error
  onRetry(): void
}) {
  const { colorScheme, styles } = useTheme()
  const { width, height } = useWindowDimensions()
  const ratio = Math.min(width / 1284, height / 2779)
  const imageWidth = ratio * INITIAL_LOGO_WIDTH

  return (
    <View
      className='flex-1 items-center justify-center'
      style={{
        backgroundColor: colorScheme === 'light' ? 'white' : '#111111',
      }}
    >
      <View
        style={{
          marginTop: -20 * ratio,
        }}
      >
        <AppBrandIcon width={imageWidth} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          position: 'absolute',
          bottom: 0,
          height: '35%',
        }}
      >
        {props.status == 'error' ? (
          <View className='items-center'>
            <View className='py-6'>
              <Text style={styles.text_danger}>{props.error?.message}</Text>
            </View>

            <Button
              style={{
                width: 200,
              }}
              size='md'
              variant='primary'
              label='重试'
              onPress={props.onRetry}
            />
          </View>
        ) : (
          <View
            style={{
              minWidth: 200,
              height: 50,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Loader />
            <View style={{ marginTop: 12 }}>
              {props.status === 'checking' && (
                <Text style={styles.text} className='text-center'>
                  正在等待 Cloudflare 检测
                </Text>
              )}
              {props.status === 'checked' && (
                <Text style={styles.text} className='text-center'>
                  Cloudflare 检测完成，完成最后初始化
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
