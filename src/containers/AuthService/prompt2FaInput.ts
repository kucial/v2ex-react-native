import { Alert } from 'react-native'

import { logout, verify2faCode } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'

async function promptInput(context) {
  return new Promise((resolve) => {
    Alert.prompt(
      context.message,
      context.data.problems?.join(''),
      [
        {
          text: '退出登录',
          onPress: async () => {
            try {
              await logout()
              resolve({
                action: 'logout',
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
              await verify2faCode({ code: value, once: context.data.once })
              resolve({
                action: '2fa_verified',
              })
            } catch (err) {
              resolve(err)
            }
          },
        },
      ],
      'plain-text',
    )
  })
}

const shouldPrompt = (info: any) => {
  if (
    info instanceof ApiError &&
    (info.code === '2FA_ENABLED' || info.code === '2FA_VERIFY_FAILED')
  ) {
    return true
  }
}

let open = false
let promptContext = null

export default async function prompt2faInput(
  initContext: ApiError<{ problems?: string[]; once: string }>,
): Promise<{ action: 'logout' } | { action: '2fa_verified' } | null> {
  if (open) {
    return null
  }

  open = true
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
  open = false
  return result
}
