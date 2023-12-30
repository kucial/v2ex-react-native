import { useSharedValue } from 'react-native-reanimated'

import { useAuthService } from '@/containers/AuthService'

import MemberTopics from '../MemberScreen/MemberTopics'

const voidFunction = () => {
  // nothting.
}
const style = {}

export default function CreatedTopicsScreen() {
  const { user } = useAuthService()
  const scrollY = useSharedValue(0)

  return (
    <MemberTopics
      username={user.username}
      scrollY={scrollY}
      contentContainerStyle={style}
      isFocused={true}
      onGetRef={voidFunction}
    />
  )
}
