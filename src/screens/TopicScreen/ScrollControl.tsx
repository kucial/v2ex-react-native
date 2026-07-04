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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

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

export type ScrollControlApi = {
  setAction(action: Action): void
}

const ScrollControl = forwardRef<ScrollControlApi, ScrollControlProps>(
  (props, ref) => {
    const { max, onNavTo, renderButton } = props
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
        onNavTo(0)
        return
      }
      if (action === 'to_bottom') {
        onNavTo(max)
        return
      }
    }, [action, max, onNavTo])

    useImperativeHandle(
      ref,
      () => ({
        setAction,
      }),
      [],
    )

    return (
      <>
        {renderButton({ action, onPress: handlePress })}

        <TrueSheet
          ref={inputModalRef}
          detents={['auto']}
          backgroundColor={styles.overlay.backgroundColor}
          grabber={false}
        >
          <View style={Platform.OS === 'android' && scrollControlStyles.pb16}>
            <View style={scrollControlStyles.modalContent}>
              <View style={scrollControlStyles.row}>
                <View
                  style={[
                    scrollControlStyles.inputBox,
                    styles.border,
                    styles.overlay_input__bg,
                  ]}
                >
                  <View style={scrollControlStyles.pl3}>
                    <Text style={styles.text_desc}>#</Text>
                  </View>
                  <View style={scrollControlStyles.flex1}>
                    <TextInput
                      autoFocus
                      keyboardType='number-pad'
                      placeholder={`最大: ${max}`}
                      placeholderTextColor={theme.colors.text_placeholder}
                      value={target}
                      onChangeText={setTarget}
                      style={[
                        scrollControlStyles.input,
                        {
                          color: theme.colors.text,
                        },
                      ]}
                      selectionColor={theme.colors.primary}
                    />
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      scrollControlStyles.circleBtn,
                      scrollControlStyles.mrNeg1,
                      pressed && scrollControlStyles.pressed60,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss()
                      inputModalRef.current?.dismiss()
                      onNavTo(0)
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
                    style={({ pressed }) => [
                      scrollControlStyles.circleBtn,
                      pressed && scrollControlStyles.pressed60,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss()
                      inputModalRef.current?.dismiss()
                      onNavTo(max)
                    }}
                  >
                    <ToBottomIcon size={24} color={styles.text_meta.color} />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      scrollControlStyles.confirmBtn,
                      styles.btn_primary__bg,
                      pressed && scrollControlStyles.pressed60,
                    ]}
                    onPress={(e) => {
                      const targetNum = parseInt(target, 10)
                      if (targetNum && targetNum <= max) {
                        onNavTo(Math.min(targetNum, max))
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

const scrollControlStyles = StyleSheet.create({
  pb16: {
    paddingBottom: 64,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'column',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  inputBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 48,
  },
  pl3: {
    paddingLeft: 12,
  },
  flex1: {
    flex: 1,
  },
  input: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 8,
    minHeight: 36,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mrNeg1: {
    marginRight: -4,
  },
  pressed60: {
    opacity: 0.6,
  },
  confirmBtn: {
    height: 34,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginLeft: 3,
    marginRight: 6,
  },
})

export default memo(ScrollControl)
