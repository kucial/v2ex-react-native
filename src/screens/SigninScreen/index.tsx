import { useCallback, useEffect, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import { use2FaModalPrompt } from '@/containers/AuthService/2fa'

import GoogleSign from './GoogleSign'
import PasswordSign from './PasswordSign'

type SignInType = 'password' | 'google'
type SigninScreenProps = NativeStackScreenProps<AppStackParamList, 'signin'>

export default function SigninScreen(props: SigninScreenProps) {
  const { navigation } = props
  const [type, setType] = useState<SignInType>('password')
  const alert = useAlertService()
  const {
    fetchCurrentUser,
    user: currentUser,
    getNextAction,
  } = useAuthService()
  const prompt2faModal = use2FaModalPrompt()
  const extraState = useRef(null)

  const handleSuccess = useCallback(
    async (state?: { code: '2fa'; once: string; message: string }) => {
      await fetchCurrentUser(true)
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
      navigation.goBack()
      const nextAction = getNextAction()
      if (nextAction) {
        nextAction()
      }
    }
  }, [currentUser])

  switch (type) {
    case 'password':
      return (
        <PasswordSign
          {...props}
          onSelectGoogleSignin={() => {
            setType('google')
          }}
          onSuccess={handleSuccess}
        />
      )
    case 'google':
      return (
        <GoogleSign
          {...props}
          onSelectPasswordSignin={() => {
            setType('password')
          }}
          onSuccess={handleSuccess}
        />
      )
  }
}
