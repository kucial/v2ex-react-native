import React from 'react'
import { useAuthService } from '@/containers/AuthService'
import MemberTopics from '../MemberScreen/MemberTopics'

export default function CreatedTopicsScreen() {
  const { user } = useAuthService()

  return <MemberTopics username={user.username} />
}
