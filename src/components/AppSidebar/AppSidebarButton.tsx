import { ReactElement } from 'react'
import {
  ColorValue,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { useLayoutStyle } from './context'

type SidebarIconProps = {
  color: ColorValue
  size: number
  style?: TextStyle
}

function AppSidebarButton(props: {
  Icon: (props: SidebarIconProps) => ReactElement
  label: string
  isActive: boolean
  staticColor: ColorValue
  activeColor: ColorValue
  onPress: PressableProps['onPress']
  disabled?: boolean
  iconStyle?: TextStyle
  badge?: number
  isLast?: boolean
  style?: ViewStyle
}) {
  const { styles, theme } = useTheme()
  const { Icon, isActive, onPress, staticColor, activeColor, iconStyle } = props
  const layoutStyle = useLayoutStyle()
  return (
    <Pressable
      style={({ pressed }) => [
        sidebarBtnStyles.btn,
        layoutStyle,
        props.style,
        isActive && {
          backgroundColor: theme.colors.bg_layer2,
        },
        pressed && sidebarBtnStyles.pressed,
      ]}
      accessibilityLabel={props.label}
      accessibilityRole='button'
      accessibilityState={{
        disabled: props.disabled,
        selected: isActive,
      }}
      disabled={props.disabled}
      onPress={(e) => {
        if (isActive) {
          return
        }
        onPress?.(e)
      }}
    >
      <View style={sidebarBtnStyles.iconContainer}>
        <Icon
          style={iconStyle}
          size={24}
          color={isActive ? activeColor : staticColor}
        />
        {!!props.badge && (
          <View
            style={[
              sidebarBtnStyles.badge,
              styles.btn_primary__bg,
              {
                borderColor: theme.colors.bg_overlay,
              },
            ]}
          >
            <Text
              style={[sidebarBtnStyles.badgeText, styles.btn_primary__text]}
            >
              {props.badge}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const sidebarBtnStyles = StyleSheet.create({
  btn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.92 }],
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 6,
    minWidth: 12,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  badgeText: {
    fontSize: 10,
    textAlign: 'center',
  },
})

export default AppSidebarButton
