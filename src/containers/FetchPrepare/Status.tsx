import { Text, useWindowDimensions, View } from 'react-native'

import AppBrandIcon from '@/components/AppBrandIcon'
import Button from '@/components/Button'
import Loader from '@/components/Loader'

import { useTheme } from '../ThemeService'

export default function Status(props: { error?: Error; onRetry(): void }) {
  const { colorScheme, styles } = useTheme()
  const { width, height } = useWindowDimensions()
  const ratio = Math.min(width / 1284, height / 2779)
  const imageWidth = ratio * 542

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: colorScheme === 'light' ? 'white' : '#111111',
      }}>
      <View
        style={{
          marginTop: -50 * ratio,
          marginLeft: 54 * ratio,
        }}>
        <AppBrandIcon width={imageWidth} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          position: 'absolute',
          bottom: 0,
          height: '35%',
        }}>
        {props.error ? (
          <View className="items-center">
            <View className="py-6">
              <Text style={styles.text_danger}>{props.error.message}</Text>
            </View>

            <Button
              style={{
                width: 200,
              }}
              size="md"
              variant="primary"
              label="重试"
              onPress={props.onRetry}
            />
          </View>
        ) : (
          <Loader />
        )}
      </View>
    </View>
  )
}
