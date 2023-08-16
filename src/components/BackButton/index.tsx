import { GestureResponderEvent, Platform, ViewStyle } from 'react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native'

import Button from '../Button'

export default function BackButton({
  tintColor,
  onPress,
  style,
}: {
  tintColor: string
  onPress: (event: GestureResponderEvent) => void
  style?: ViewStyle
}) {
  return (
    <Button
      className="w-[44px] h-[44px] rounded-full"
      variant="icon"
      style={style}
      onPress={onPress}
      radius={22}>
      <ChevronLeftIcon
        size={28}
        color={tintColor}
        style={{
          marginLeft: -4,
        }}
      />
    </Button>
  )
}

export const headerLeft = ({
  tintColor,
  canGoBack,
}: {
  tintColor: string
  canGoBack: boolean
}) => {
  const navigation = useNavigation()
  if (!canGoBack) {
    return null
  }
  return (
    <BackButton
      tintColor={tintColor}
      onPress={navigation.goBack}
      style={Platform.select({
        android: {
          marginLeft: -12,
          marginRight: 4,
        },
        ios: {
          marginLeft: -16,
        },
      })}
    />
  )
}
