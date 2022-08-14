import { createContext, useEffect, useMemo, useContext } from 'react'
import { useNavigation } from '@react-navigation/native'
import useSWR from 'swr'
import fetcher from '@/utils/fetcher'
export const AuthServiceContext = createContext({
  user: null,
  status: 'none', // none | loading | loaded | failed | reset
  fetchCurrentUser: () => Promise.reject(new Error('no initialized')),
  logout: () => Promise.resolve(),
  composeAuthedNavigation: (callback) => {
    return callback || function () {}
  }
})
let onceLogined = false
const mapStatus = (swr) => {
  if (swr.isValidating) {
    return 'loading'
  }
  if (swr.data) {
    onceLogined = true
    return 'loaded'
  }
  if (swr.error) {
    return 'failed'
  }
  if (onceLogined) {
    return 'reset'
  }
  return 'none'
}
export default function AuthService(props) {
  const navigation = useNavigation()
  const userSwr = useSWR('/custom/auth/current-user.json', {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false
  })
  console.log(userSwr)
  const service = useMemo(() => {
    let nextAction
    return {
      user: userSwr.error ? null : userSwr.data,
      status: mapStatus(userSwr),
      fetchCurrentUser: userSwr.mutate,
      logout: async function () {
        try {
          await fetcher('/custom/auth/logout.json')
        } catch (err) {
          console.log(err)
        } finally {
          userSwr.mutate(undefined)
        }
      },
      goToSigninSreen() {
        navigation.navigate('signin')
      },
      composeAuthedNavigation: (callback) => {
        return (...args) => {
          if (!userSwr.data) {
            navigation.navigate('signin')
            if (callback) {
              nextAction = () => {
                callback(...args)
              }
            }
            return
          }
          callback?.(...args)
        }
      },
      getNextAction: () => {
        if (nextAction) {
          const action = nextAction
          nextAction = undefined
          return action
        }
        return undefined
      }
    }
  }, [userSwr])

  useEffect(() => {
    userSwr.mutate()
  }, [])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
