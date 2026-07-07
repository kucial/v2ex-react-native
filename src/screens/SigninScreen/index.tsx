import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'

import { useAlertService } from '@/containers/AlertService'
import { use2FaModalPrompt } from '@/containers/AuthWatcher/components/TwoFAModal'
import { useAuthStore, useCurrentUser } from '@/stores/auth'

import GoogleSign from './GoogleSign'
import PasswordSign from './PasswordSign'

type SignInType = 'password' | 'google'

export default function SigninScreen() {
  const router = useRouter()
  const [type, setType] = useState<SignInType>('password')
  const alert = useAlertService()
  const currentUser = useCurrentUser()
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser)
  const popNextAction = useAuthStore((s) => s.popNextAction)
  const prompt2faModal = use2FaModalPrompt()
  const extraState = useRef(null)

  const handleSuccess = useCallback(
    async (state?: { code: '2fa'; once: string; message: string }) => {
      await fetchCurrentUser()
      alert.show({ type: 'success', message: '登录成功' })
      extraState.current = state
    },
    [],
  )

  useEffect(() => {
    if (currentUser) {
      if (extraState.current) {
        setTimeout(() => {
          prompt2faModal({
            once: extraState.current.once,
            message: extraState.current.message,
          })
        }, 300)
      }
      router.back()
      const nextAction = popNextAction()
      if (nextAction) {
        nextAction()
      }
    }
  }, [currentUser])

  switch (type) {
    case 'password':
      return (
        <PasswordSign
          onSelectGoogleSignin={() => {
            setType('google')
          }}
          onSuccess={handleSuccess}
        />
      )
    case 'google':
      return (
        <GoogleSign
          onSelectPasswordSignin={() => {
            setType('password')
          }}
          onSuccess={handleSuccess}
        />
      )
  }
}
