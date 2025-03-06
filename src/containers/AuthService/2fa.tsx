import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Platform, Text, TextInput, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet'

import Button from '@/components/Button'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import { logout, subscribe, verify2faCode } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'
import { TFA_Error } from '@/utils/v2ex-client/types'

import { useAlertService } from '../AlertService'
import { useTheme } from '../ThemeService'

const TwoFAModalContext = createContext(null)

export function use2FaModalPrompt() {
  const { showModal } = useContext(TwoFAModalContext)
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
  }, [])
  return null
}

export function TwoFAServiceProvider({ children }) {
  const { styles, theme } = useTheme()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const visible = useRef(false)
  const promise = useRef(null)
  const [modalState, setModalState] = useState({
    message: '',
    once: '',
    resolve: null,
  })
  const [input, setInput] = useState('')
  const snapPoints = [270] // Adjust the height of the bottom sheet
  const alert = useAlertService()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const showModal = (message: string, once: string) => {
    if (promise.current) {
      return Promise.resolve({ state: '2fa_prompting' })
    }
    promise.current = new Promise((resolve) => {
      bottomSheetModalRef.current?.present()
      visible.current = true
      setModalState({ message, once, resolve })
    })
    return promise.current
  }

  const hideModal = () => {
    bottomSheetModalRef.current?.close()
    visible.current = false
    promise.current = null
    setInput('')
  }

  const handleModalDismiss = () => {
    promise.current = null
    visible.current = false
    setInput('')
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await verify2faCode({ code: input, once: modalState.once })
      modalState.resolve({
        state: '2fa_verified',
      })
      alert.show({ type: 'success', message: '2FA 验证成功' })
      hideModal()
    } catch (err) {
      setModalState((prevState) => ({
        ...prevState,
        once: (err as ApiError).data.once,
        message: err.message,
      }))
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleLogout = async () => {
    try {
      await logout()
      modalState.resolve({ state: 'logout' })
      hideModal()
      alert.show({ type: 'success', message: '已退出登录，请刷新...' })
    } catch (err) {
      modalState.resolve(err)
    }
  }

  const Input = Platform.OS === 'android' ? TextInput : BottomSheetTextInput

  return (
    <TwoFAModalContext.Provider value={{ showModal, hideModal, modalState }}>
      {children}
      <MyBottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={handleModalDismiss}>
        <BottomSheetView>
          <View className="px-4 flex-col gap-4">
            <View className="flex flex-row justify-center py-2">
              <Text style={[styles.text]}>{modalState.message}</Text>
            </View>
            <View>
              <View className="rounded-lg" style={[styles.overlay_input__bg]}>
                <Input
                  placeholder="Enter 2FA Code"
                  value={input}
                  onChangeText={setInput}
                  keyboardType="numeric"
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
              size="md"
              variant="primary"
              label="提交"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <Button
              size="md"
              variant="secondary"
              label="退出登录"
              onPress={handleLogout}
              disabled={isSubmitting}
            />
          </View>
        </BottomSheetView>
      </MyBottomSheetModal>
      <TwoFAWatcher />
    </TwoFAModalContext.Provider>
  )
}
