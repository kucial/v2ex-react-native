import { Alert } from 'react-native'

import { logout, verify2faCode } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'

async function promptInput(context: { message: string; once: string }) {
  return new Promise((resolve) => {
    Alert.prompt(
      context.message,
      '',
      [
        {
          text: '退出登录',
          onPress: async () => {
            try {
              await logout()
              resolve({
                state: 'logout',
              })
            } catch (err) {
              resolve(err)
            }
          },
          style: 'cancel',
        },
        {
          text: '提交',
          onPress: async (value) => {
            try {
              await verify2faCode({ code: value, once: context.once })
              resolve({
                state: '2fa_verified',
              })
            } catch (err) {
              resolve({
                state: '2fa',
                once: (err as ApiError).data.once,
                message: err.message,
              })
            }
          },
        },
      ],
      'plain-text',
    )
  })
}

type TFAState = '2fa' | '2fa_verfied' | 'logout' | '2fa_prompting'

const shouldPrompt = (info: { state: TFAState }) => {
  if (info.state == '2fa') {
    return true
  }
}

let prompting = false
let promptContext = null

export default async function prompt2faInput(initContext: {
  state: '2fa'
  once: string
  message: string
}): Promise<
  { state: 'logout' } | { state: '2fa_verified' } | { state: '2fa_prompting' }
> {
  if (prompting) {
    return { state: '2fa_prompting' }
  }

  prompting = true
  let result = null
  promptContext = initContext
  while (true) {
    result = await promptInput(promptContext)
    if (shouldPrompt(result)) {
      promptContext = result
    } else {
      break
    }
  }
  promptContext = null
  prompting = false
  return result
}
