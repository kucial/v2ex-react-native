import { View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import NavigationHeader from '@/components/NavigationHeader'

import { useCurrentUser } from '@/stores/auth'

import MemberReplies from '../MemberScreen/MemberReplies'

const voidFunction = () => {
  // nothting.
}
const style = {}

export default function RepliedTopicsScreen() {
  const user = useCurrentUser()
  const scrollY = useSharedValue(0)
  return (
    <View className='flex-1'>
      <NavigationHeader canGoBack title='回复的主题' />
      <MemberReplies
        username={user.username}
        scrollY={scrollY}
        contentContainerStyle={style}
        isFocused={true}
        onGetRef={voidFunction}
      />
    </View>
  )
}
