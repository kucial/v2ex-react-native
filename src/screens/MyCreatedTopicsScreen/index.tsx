import { View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import NavigationHeader from '@/components/NavigationHeader'

import { useCurrentUser } from '@/stores/auth'

import MemberTopics from '../MemberScreen/MemberTopics'

const voidFunction = () => {
  // nothting.
}
const style = {}

export default function CreatedTopicsScreen() {
  const user = useCurrentUser()
  const scrollY = useSharedValue(0)

  return (
    <View className='flex-1'>
      <NavigationHeader canGoBack title='创建的主题' />
      <MemberTopics
        username={user.username}
        scrollY={scrollY}
        contentContainerStyle={style}
        isFocused={true}
        onGetRef={voidFunction}
      />
    </View>
  )
}
