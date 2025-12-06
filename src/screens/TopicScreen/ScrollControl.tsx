import {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import ToBottomIcon from '@/components/ToBottomIcon'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

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

export type ScrollControlApi = {
  setAction(action: Action): void
}

const ScrollControl = forwardRef<ScrollControlApi, ScrollControlProps>(
  (props, ref) => {
    const [action, setAction] = useState<Action>('')
    const inputModalRef = useRef<TrueSheet>(null)
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

        <TrueSheet
          ref={inputModalRef}
          detents={['auto']}
          backgroundColor={styles.overlay.backgroundColor}
          grabber={false}
        >
          <View className={cn(Platform.OS === 'android' && 'pb-16')}>
            <View className={cn('px-4 py-4 flex flex-col flex-1')}>
              <View className='flex flex-row'>
                <View
                  className='rounded-lg flex flex-row items-center flex-1 h-12'
                  style={[styles.border, styles.overlay_input__bg]}
                >
                  <View className='pl-3'>
                    <Text style={styles.text_desc}>#</Text>
                  </View>
                  <View className='flex-1'>
                    <TextInput
                      autoFocus
                      keyboardType='number-pad'
                      placeholder={`最大: ${props.max}`}
                      placeholderTextColor={theme.colors.text_placeholder}
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
                    className='w-[40px] h-[40px] rounded-full items-center justify-center active:opacity-60 dark:active:bg-neutral-600 -mr-1'
                    onPress={() => {
                      Keyboard.dismiss()
                      inputModalRef.current?.dismiss()
                      props.onNavTo(0)
                    }}
                  >
                    <View
                      style={{
                        transform: [{ rotate: '180deg' }],
                      }}
                    >
                      <ToBottomIcon size={24} color={styles.text_meta.color} />
                    </View>
                  </Pressable>
                  <Pressable
                    className='w-[40px] h-[40px] rounded-full items-center justify-center active:opacity-60 dark:active:bg-neutral-600'
                    onPress={() => {
                      Keyboard.dismiss()
                      inputModalRef.current?.dismiss()
                      props.onNavTo(props.max)
                    }}
                  >
                    <ToBottomIcon size={24} color={styles.text_meta.color} />
                  </Pressable>
                  <Pressable
                    className={cn(
                      'h-[34px] w-[64px] items-center justify-center rounded-md ml-[3px] mr-[6px]',
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
                    }}
                  >
                    <Text style={styles.btn_primary__text}>定位</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </TrueSheet>
      </>
    )
  },
)

ScrollControl.displayName = 'ScrollControl'

export default memo(ScrollControl)
