import { GestureResponderEvent, Pressable, View } from 'react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { HeaderBackButton } from '@react-navigation/elements'
import { useNavigation } from '@react-navigation/native'

export default function BackButton({
  tintColor,
  onPress,
}: {
  tintColor: string
  onPress: (event: GestureResponderEvent) => void
}) {
  return (
    <Pressable
      className="w-[44px] h-[44px] rounded-full items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
      onPress={onPress}>
      <ChevronLeftIcon
        size={28}
        color={tintColor}
        style={{
          marginLeft: -4,
        }}
      />
    </Pressable>
  )
}

export const headerLeft = ({
  tintColor,
  canGoBack,
  label,
}: {
  tintColor: string
  canGoBack: boolean
  label: any
}) => {
  const navigation = useNavigation()
  if (!canGoBack) {
    return null
  }
  return (
    <HeaderBackButton
      tintColor={tintColor}
      onPress={navigation.goBack}
      style={{
        marginLeft: -16,
      }}
      backImage={() => (
        <View
          style={{
            paddingLeft: 10,
            paddingRight: label ? 6 : 10,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ChevronLeftIcon
            size={28}
            color={tintColor}
            style={{
              marginLeft: -4,
            }}
          />
        </View>
      )}
      canGoBack={canGoBack}
    />
  )
}
