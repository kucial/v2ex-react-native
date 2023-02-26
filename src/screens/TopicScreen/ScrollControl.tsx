import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Pressable, SafeAreaView, Text, View } from 'react-native'
import { Keyboard } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import classNames from 'classnames'

import NumberIcon from '@/components/NumberIcon'
import ToBottomIcon from '@/components/ToBottomIcon'
import { useTheme } from '@/containers/ThemeService'

export type ScrollControlProps = {
  max: number
  onNavTo(index: number): void
}

type Action = 'to_top' | 'to_bottom' | ''
const conversationSnapPoints = [80]

export type ScrollControlApi = {
  setAction(action: Action): void
}

const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      onPress={() => {
        Keyboard.dismiss()
      }}
    />
  )
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
        <Pressable
          className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={handlePress}>
          <View className="my-1">
            {action ? (
              <View
                style={
                  action === 'to_top' && {
                    transform: [{ rotate: '180deg' }],
                  }
                }>
                <ToBottomIcon size={24} color={styles.text_meta.color} />
              </View>
            ) : (
              <NumberIcon size={24} color={styles.text_meta.color} />
            )}
          </View>
          <Text className="text-[10px]" style={styles.text_meta}>
            {action === 'to_top' && '至顶'}
            {action === 'to_bottom' && '至底'}
            {!action && '定位'}
          </Text>
          {/* <Text className="text-[10px]" style={styles.text_meta}>
        到达底部
      </Text> */}
          <BottomSheetModal
            snapPoints={conversationSnapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.overlay}
            ref={inputModalRef}
            index={0}
            handleIndicatorStyle={{
              backgroundColor: theme.colors.bts_handle_bg,
            }}>
            <View className="pl-3 pr-1 flex flex-col flex-1">
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
                    className={classNames(
                      'h-[34px] w-[64px] items-center justify-center rounded-md mr-[3px]',
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
                <View className="ml-2 mr-1 justify-center">
                  <View
                    className="h-[22px] w-[1px]"
                    style={styles.layer3}></View>
                </View>
                <View className="flex flex-row grid-x-2 items-center">
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
                </View>
              </View>
            </View>
          </BottomSheetModal>
        </Pressable>
      </>
    )
  },
)

ScrollControl.displayName = 'ScrollControl'

export default memo(ScrollControl)
