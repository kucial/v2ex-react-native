import { Pressable, SafeAreaView, Text, View } from 'react-native'
import {
  HomeIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import { useCurrentRoute } from '@/containers/NavigationContainer'
import { useTheme } from '@/containers/ThemeService'

export default function AppSidebar() {
  const { theme, styles } = useTheme()
  const currentRoute = useCurrentRoute()
  const navigation = useNavigation()
  console.log(currentRoute, navigation)

  return (
    <SafeAreaView
      className="flex-1 flex flex-column"
      style={[styles.border_light, styles.border_r]}>
      <View className="h-[200]">
        <Text>Dynamic center</Text>
      </View>

      <View className="w-full absolute bottom-0  items-center pb-12">
        <Pressable
          style={styles.layer1}
          className={classNames(
            'w-[52px] h-[52px] rounded-lg items-center justify-center mb-3',
            'active:opacity-50 active:bg-neutral-100 dark:active:bg-neutral-600',
          )}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'nodes' }],
            })
            // navigation...
          }}>
          <RectangleStackIcon color={theme.colors.primary} />
          <Text
            className={classNames(
              'text-[10px] mt-1',
              currentRoute?.name === 'nodes' && 'font-bold',
            )}>
            节点
          </Text>
        </Pressable>
        <Pressable
          className="w-[52px] h-[52px] rounded-lg items-center justify-center mb-3"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'home' }],
            })
          }}>
          <HomeIcon color={theme.colors.primary} />
          <Text
            className={classNames(
              'text-[10px] mt-1',
              currentRoute?.name === 'home' && 'font-bold',
            )}>
            主页
          </Text>
        </Pressable>
        <Pressable
          className="w-[52px] h-[52px] rounded-lg items-center justify-center"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'my' }],
            })
          }}>
          <UserIcon color={theme.colors.primary} />
          <Text className="text-[10px] mt-1">我的</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
