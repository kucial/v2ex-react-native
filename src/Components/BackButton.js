import { Pressable } from 'react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'

function BackButton(props) {
  return (
    <Pressable
      className="w-[44px] h-[44px] rounded-full items-center justify-center active:bg-gray-100 active:opacity-60"
      onPress={props.onPress}>
      <ChevronLeftIcon size={28} color="#111" />
    </Pressable>
  )
}

export default BackButton
