import { useEffect, useRef, useState } from 'react'
import { Platform, Text, TextInput, View } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { create } from 'zustand'

import Button from '@/components/Button'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { logout, subscribe, verify2faCode } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'
import { TFA_Error } from '@/utils/v2ex-client/types'

type TwoFAState = {
  visible: boolean
  message: string
  once: string
  resolve: ((value: any) => void) | null
  showModal: (message: string, once: string) => Promise<any>
  hideModal: () => void
  setModalState: (state: Partial<TwoFAState>) => void
  handleModalDismiss: () => void
}

export const useTwoFAStore = create<TwoFAState>((set, get) => ({
  visible: false,
  message: '',
  once: '',
  resolve: null,
  showModal: (message: string, once: string) => {
    if (get().resolve) {
      return Promise.resolve({ state: '2fa_prompting' })
    }
    return new Promise((resolve) => {
      set({ visible: true, message, once, resolve })
    })
  },
  hideModal: () => {
    set({ visible: false, resolve: null })
  },
  setModalState: (state) => set(state),
  handleModalDismiss: () => {
    set({ visible: false, resolve: null })
  },
}))

export function use2FaModalPrompt() {
  const showModal = useTwoFAStore((state) => state.showModal)
  return async function promptInput(context: {
    message: string
    once: string
  }) {
    const result = await showModal(context.message, context.once)
    return result
  }
}

function TwoFAWatcher() {
  const prompt2faModal = use2FaModalPrompt()
  useEffect(() => {
    const unsubscribe = subscribe('2fa_enabled', async (error: TFA_Error) => {
      const result = await prompt2faModal({
        once: error.data.once,
        message: error.message,
      })
    })

    return unsubscribe
  }, [prompt2faModal])
  return null
}

export function TwoFAModal() {
  const { styles, theme } = useTheme()
  const bottomSheetModalRef = useRef<TrueSheet>(null)

  const [input, setInput] = useState('')
  const alert = useAlertService()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    visible,
    message,
    once,
    resolve,
    hideModal,
    handleModalDismiss,
    setModalState,
  } = useTwoFAStore()

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
      setInput('')
    }
  }, [visible])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await verify2faCode({ code: input, once })
      resolve?.({
        state: '2fa_verified',
      })
      alert.show({ type: 'success', message: '2FA 验证成功' })
      hideModal()
    } catch (err) {
      setModalState({
        once: (err as ApiError).data.once,
        message: (err as ApiError).message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      resolve?.({ state: 'logout' })
      hideModal()
      alert.show({ type: 'success', message: '已退出登录，请刷新...' })
    } catch (err) {
      resolve?.(err)
    }
  }

  return (
    <>
      <TrueSheet
        ref={bottomSheetModalRef}
        detents={['auto']}
        onDidDismiss={handleModalDismiss}
        backgroundColor={styles.overlay.backgroundColor}
      >
        <View className='pt-4 h-[280]'>
          <View className='px-4 flex-col gap-4'>
            <View className='flex flex-row justify-center py-2'>
              <Text style={[styles.text]}>{message}</Text>
            </View>
            <View>
              <View className='rounded-lg' style={[styles.overlay_input__bg]}>
                <TextInput
                  placeholder='Enter 2FA Code'
                  value={input}
                  onChangeText={setInput}
                  keyboardType='numeric'
                  autoFocus
                  style={[
                    {
                      width: '100%',
                      height: 44,
                      paddingHorizontal: 8,
                      textAlign: 'center',
                      fontSize: 16,
                      paddingVertical: Platform.OS === 'android' ? 8 : 4,
                      color: theme.colors.text,
                      verticalAlign:
                        Platform.OS === 'android' ? 'top' : undefined,
                    },
                  ]}
                  placeholderTextColor={theme.colors.text_meta}
                  selectionColor={theme.colors.primary}
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>
            <Button
              size='md'
              variant='primary'
              label='提交'
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <Button
              size='md'
              variant='secondary'
              label='退出登录'
              onPress={handleLogout}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </TrueSheet>
      <TwoFAWatcher />
    </>
  )
}
