import { createContext, useState, useEffect, useMemo, useContext } from 'react'
import { useNavigation } from '@react-navigation/native'
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

export default function AuthServiceProvider(props) {
  const navigation = useNavigation()
  const [state, setState] = useState({
    user: null,
    status: 'none'
  })

  const service = useMemo(
    () => ({
      ...state,
      fetchCurrentUser: () => {
        setState((prev) => ({
          ...prev,
          status: 'loading'
        }))
        fetcher('/custom/auth/current-user.json')
          .then((res) => {
            setState((prev) => ({
              ...prev,
              user: res.data,
              error: null,
              status: 'loaded'
            }))
          })
          .catch((err) => {
            if (err.code === 'not_authenticated') {
              setState({
                status: 'failed',
                error: err
              })
            }
          })
      },
      logout: async function () {
        await fetcher('/custom/auth/logout.json')
        setState((prev) => ({
          ...prev,
          user: null,
          status: 'reset'
        }))
      },
      goToSigninSreen() {
        navigation.navigate('signin')
      },
      composeAuthedNavigation: (callback) => {
        return (...args) => {
          if (!state.user) {
            navigation.navigate('signin')
            return
          }
          callback?.(...args)
        }
      }
    }),
    [state, setState]
  )

  useEffect(() => {
    service.fetchCurrentUser()
  }, [])

  return (
    <AuthServiceContext.Provider value={service}>
      {props.children}
    </AuthServiceContext.Provider>
  )
}

export const useAuthService = () => useContext(AuthServiceContext)
