import React from 'react'
import { View, Text, SafeAreaView, Pressable } from 'react-native'
import classNames from 'classnames'
import { InformationCircleIcon } from 'react-native-heroicons/outline'
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

export default function ErrorNoticeView(props) {
  const { colorScheme } = useColorScheme()

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="px-4">
        <View className="pt-[48px]">
          <View className="flex flex-row mb-8">
            <InformationCircleIcon
              size={36}
              style={{ marginRight: 8 }}
              color={
                colorScheme === 'dark'
                  ? colors.neutral[300]
                  : colors.neutral[700]
              }
            />
            <Text className="text-[32px] text-neutral-700 dark:text-neutral-300">
              哎呦，出了点问题
            </Text>
          </View>
          <Text className="leading-[23px] text-[16px] mb-8 text-neutral-700 dark:text-neutral-300">
            应用程序遇到问题，无法继续。 {'\n'}我们道歉对于由此造成的任何不便！
            {'\n'}
            按下下方按钮即可 重新启动应用程序。{'\n'}
            如果此问题仍然存在，请与我们联系。
          </Text>
          <Pressable
            className={classNames(
              'h-[50px] rounded-lg items-center justify-center active:opacity-60',
              'bg-neutral-900 dark:bg-amber-100'
            )}
            onPress={props.onReset}>
            <Text className="text-base text-white dark:text-neutral-900">
              重新启动APP
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
