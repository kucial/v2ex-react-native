import { useCallback, useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import prompt2faInput from '@/containers/AuthService/prompt2FaInput'

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

  const handleSuccess = useCallback(
    async (state?: { code: '2fa'; once: string; message: string }) => {
      console.log('state', state)
      if (state) {
        const result = await prompt2faInput({
          state: '2fa',
          once: state.once,
          message: state.message,
        })
        if (result.state == 'logout') {
          return
        }
        if (result.state == '2fa_prompting') {
          return
        }
      }
      await fetchCurrentUser(true)
      alert.show({ type: 'success', message: '登录成功' })
    },
    [],
  )

  useEffect(() => {
    if (currentUser) {
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
