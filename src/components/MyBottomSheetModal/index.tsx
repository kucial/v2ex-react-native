import { forwardRef, useMemo } from 'react'
import { Keyboard, useWindowDimensions } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal as BaseModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet'

import { APP_SIDEBAR_WIDTH, CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

const DismissBackdropComponent = (props: BottomSheetBackdropProps) => {
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

const MyBottomSheetModal = forwardRef<BaseModal, BottomSheetModalProps>(
  (props, ref) => {
    const { styles, theme } = useTheme()
    const padLayout = usePadLayout()
    const { width } = useWindowDimensions()
    const sheetOffsetStyle = useMemo(() => {
      if (padLayout) {
        const margin =
          (width - APP_SIDEBAR_WIDTH - CONTENT_CONTAINER_MAX_WIDTH) / 2
        return {
          marginLeft: margin + APP_SIDEBAR_WIDTH,
          marginRight: margin,
        }
      }
    }, [padLayout, width])
    return (
      <BaseModal
        backdropComponent={DismissBackdropComponent}
        backgroundStyle={styles.overlay}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.bts_handle_bg,
        }}
        style={sheetOffsetStyle}
        {...props}
        ref={ref}
      />
    )
  },
)

MyBottomSheetModal.displayName = 'MyBottomSheetModal'

export default MyBottomSheetModal