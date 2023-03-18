import {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Pressable, Text, View } from 'react-native'
import { Keyboard } from 'react-native'
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import classNames from 'classnames'

import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import ToBottomIcon from '@/components/ToBottomIcon'
import { useTheme } from '@/containers/ThemeService'

export type ScrollControlProps = {
  max: number
  onNavTo(index: number): void
  disabled?: boolean
  renderButton(props: {
    action: Action
    onPress: any
    disabled?: boolean
  }): ReactNode
}

type Action = 'to_top' | 'to_bottom' | ''
const conversationSnapPoints = [80]

export type ScrollControlApi = {
  setAction(action: Action): void
}

const ScrollControl = forwardRef<ScrollControlApi, ScrollControlProps>(
  (props, ref) => {
    const [action, setAction] = useState<Action>('')
    const inputModalRef = useRef<BottomSheetModal>()
    const [target, setTarget] = useState('')

    const { styles, theme } = useTheme()

    const handlePress = useCallback(() => {
      if (!action) {
        setTarget('')
        inputModalRef.current?.present()
        return
      }
      if (action === 'to_top') {
        props.onNavTo(0)
        return
      }
      if (action === 'to_bottom') {
        props.onNavTo(props.max)
        return
      }
    }, [action, props.max])

    useImperativeHandle(
      ref,
      () => ({
        setAction,
      }),
      [],
    )

    return (
      <>
        {props.renderButton({ action, onPress: handlePress })}

        <MyBottomSheetModal
          index={0}
          snapPoints={conversationSnapPoints}
          ref={inputModalRef}>
          <View className="pl-3 pr-3 flex flex-col flex-1">
            <View className="flex flex-row">
              <View
                className="rounded-lg flex flex-row items-center flex-1"
                style={[styles.border, styles.overlay_input__bg]}>
                <View className="pl-3">
                  <Text style={styles.text_desc}>#</Text>
                </View>
                <View className="flex-1">
                  <BottomSheetTextInput
                    autoFocus
                    keyboardType="number-pad"
                    placeholder={`最大: ${props.max}`}
                    value={target}
                    onChangeText={setTarget}
                    style={[
                      {
                        width: '100%',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        minHeight: 36,
                        color: theme.colors.text,
                      },
                    ]}
                    selectionColor={theme.colors.primary}
                  />
                </View>
                <Pressable
                  className="w-[40px] h-[40px] rounded-full items-center justify-center active:opacity-60 dark:active:bg-neutral-600 -mr-1"
                  onPress={() => {
                    Keyboard.dismiss()
                    inputModalRef.current?.dismiss()
                    props.onNavTo(0)
                  }}>
                  <View
                    style={{
                      transform: [{ rotate: '180deg' }],
                    }}>
                    <ToBottomIcon size={24} color={styles.text_meta.color} />
                  </View>
                </Pressable>
                <Pressable
                  className="w-[40px] h-[40px] rounded-full items-center justify-center active:opacity-60 dark:active:bg-neutral-600"
                  onPress={() => {
                    Keyboard.dismiss()
                    inputModalRef.current?.dismiss()
                    props.onNavTo(props.max)
                  }}>
                  <ToBottomIcon size={24} color={styles.text_meta.color} />
                </Pressable>
                <Pressable
                  className={classNames(
                    'h-[34px] w-[64px] items-center justify-center rounded-md mx-[3px]',
                    'active:opacity-60',
                  )}
                  style={styles.btn_primary__bg}
                  onPress={(e) => {
                    const targetNum = parseInt(target, 10)
                    if (targetNum && targetNum <= props.max) {
                      props.onNavTo(Math.min(targetNum, props.max))
                    }
                    Keyboard.dismiss()
                    inputModalRef.current?.dismiss()
                  }}>
                  <Text style={styles.btn_primary__text}>定位</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </MyBottomSheetModal>
      </>
    )
  },
)

ScrollControl.displayName = 'ScrollControl'

export default memo(ScrollControl)
