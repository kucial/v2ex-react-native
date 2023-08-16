import { forwardRef, useMemo } from 'react'
import { Keyboard, Platform, useWindowDimensions } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal as BaseModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet'

import { APP_SIDEBAR_SIZE, CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'
import { usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

const DismissBackdropComponent = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      onPress={() => {
        if (Platform.OS === 'ios') {
          Keyboard.dismiss()
        }
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
      if (padLayout.active && padLayout.orientation === 'LANDSCAPE') {
        const margin =
          (width - APP_SIDEBAR_SIZE - CONTENT_CONTAINER_MAX_WIDTH - 24) / 2
        return {
          marginLeft: margin + APP_SIDEBAR_SIZE,
          marginRight: margin,
        }
      }
      const margin = (width - CONTENT_CONTAINER_MAX_WIDTH - 24) / 2
      if (margin > 0) {
        return {
          marginLeft: margin,
          marginRight: margin,
        }
      }
    }, [padLayout.active, padLayout.orientation, width])
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
