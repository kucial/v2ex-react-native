import { Pressable, Text, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon
} from 'react-native-heroicons/outline'
import classNames from 'classnames'
import Constants from 'expo-constants'
import { useTailwind } from 'tailwindcss-react-native'

import Logo from '@/components/Logo'
import { useAuthService } from '@/containers/AuthService'

export default function MainScreenHeader(props) {
  const { navigation } = props
  const { composeAuthedNavigation, meta } = useAuthService()
  const tw = useTailwind()
  const { color } = tw('color-neutral-800 dark:color-neutral-200')
  return (
    <View
      className={classNames(
        'w-full flex-row items-center pl-4',
        'bg-white',
        'dark:bg-neutral-900'
      )}
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="flex-1">
        {props.title ? (
          <View className="pl-1">
            <Text
              className="font-bold text-[17px]"
              style={{
                color
              }}>
              {props.title}
            </Text>
          </View>
        ) : (
          <Logo
            color={color}
            style={{
              width: 47,
              height: 15
            }}
          />
        )}

        {/* <Text className="text-lg font-bold">V2EX</Text> */}
      </View>

      <View className="flex flex-row space-x-1 items-center justify-self-end pr-1">
        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={composeAuthedNavigation(() => {
            navigation.push('new-topic')
          })}>
          <DocumentPlusIcon size={24} color={color} />
        </Pressable>
        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={composeAuthedNavigation(() => {
            navigation.push('notification')
          })}>
          <View className="relative w-[24px] h-[24px]">
            <EnvelopeIcon size={24} color={color} />
            {!!meta?.unread_count && (
              <View className="absolute bg-neutral-700 top-[-6px] right-[-8px] rounded-md min-w-[12px] px-[3px] text-center border-2 border-white border-solid">
                <Text className="text-white text-[10px]">
                  {meta.unread_count}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={() => {
            navigation.push('search')
          }}>
          <MagnifyingGlassIcon size={24} color={color} />
        </Pressable>

        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={() => {
            navigation.push('viewed-topics')
          }}>
          <ClockIcon size={24} color={color} />
        </Pressable>
      </View>
    </View>
  )
}
