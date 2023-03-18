import {
  GestureResponderEvent,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native'
import { InformationCircleIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'

import { useTheme } from '@/containers/ThemeService'

type Props = {
  onReset: (event: GestureResponderEvent) => void
  onRestart: (event: GestureResponderEvent) => void
}

export default function ErrorNoticeView(props: Props) {
  const { theme, styles } = useTheme()
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={styles.layer1}>
      <View className="px-4 pb-8">
        <View className="pt-[48px]">
          <View className="flex flex-row mb-8">
            <InformationCircleIcon
              size={36}
              style={{ marginRight: 8 }}
              color={theme.colors.text}
            />
            <Text className="text-[32px]" style={styles.text}>
              哎呦，出了点问题
            </Text>
          </View>
          <Text className="leading-[23px] text-[16px] mb-8" style={styles.text}>
            应用程序遇到问题，无法继续。 {'\n'}我们道歉对于由此造成的任何不便！
            {'\n'}
            按下下方按钮即可 重新启动应用程序。{'\n'}
            如果此问题仍然存在，请与我们联系。
          </Text>
          <View className="max-w-[300px]">
            <Pressable
              className={classNames(
                'h-[50px] rounded-lg items-center justify-center active:opacity-60',
              )}
              style={styles.btn_primary__bg}
              onPress={props.onRestart}>
              <Text className="text-base" style={styles.btn_primary__text}>
                重新启动APP
              </Text>
            </Pressable>
            <Pressable
              className={classNames(
                'h-[50px] rounded-lg items-center justify-center active:opacity-60 mt-6',
              )}
              style={[styles.btn_primary__bg, ,]}
              onPress={props.onReset}>
              <View
                style={{
                  backgroundColor: theme.colors.bg_danger_mask,
                }}>
                <Text className="text-base" style={styles.text_danger}>
                  重置 APP
                </Text>
              </View>
            </Pressable>
            <View className="mt-1">
              <Text className="text-xs text-center" style={styles.text_meta}>
                （清理缓存）
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
