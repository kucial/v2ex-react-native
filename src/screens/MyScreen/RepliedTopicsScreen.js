import { useAuthService } from '@/containers/AuthService'

import MemberReplies from '../MemberScreen/MemberReplies'

export default function RepliedTopicsScreen() {
  const { user } = useAuthService()
  return <MemberReplies username={user.username} />
}
