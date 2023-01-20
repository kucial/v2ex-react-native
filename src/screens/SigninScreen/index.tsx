import { useCallback, useState, useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import GoogleSign from './GoogleSign'

type SignInType = 'password' | 'google'

import PasswordSign from './PasswordSign'
import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'

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

  const handleSuccess = useCallback(() => {
    fetchCurrentUser(true).then(() => {
      alert.alertWithType('success', '成功', '登录成功')
    })
  }, [])

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
