import { TouchableOpacity } from 'react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'

function BackButton(props) {
  return (
    <TouchableOpacity
      className="w-[44px] h-[44px] items-center justify-center active:bg-gray-100"
      onPress={props.onPress}>
      <ChevronLeftIcon size={24} color="#111" />
    </TouchableOpacity>
  )
}

export default BackButton
