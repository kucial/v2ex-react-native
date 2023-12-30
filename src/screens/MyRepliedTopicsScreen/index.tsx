import { useSharedValue } from 'react-native-reanimated'

import { useAuthService } from '@/containers/AuthService'

import MemberReplies from '../MemberScreen/MemberReplies'

const voidFunction = () => {
  // nothting.
}
const style = {}

export default function RepliedTopicsScreen() {
  const { user } = useAuthService()
  const scrollY = useSharedValue(0)
  return (
    <MemberReplies
      username={user.username}
      scrollY={scrollY}
      contentContainerStyle={style}
      isFocused={true}
      onGetRef={voidFunction}
    />
  )
}
