import {
  ColorValue,
  Pressable,
  PressableProps,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { HomeIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'

import { useTheme } from '@/containers/ThemeService'

function AppSidebarButton(props: {
  Icon: typeof HomeIcon
  label: string
  isActive: boolean
  staticColor: ColorValue
  activeColor: ColorValue
  onPress: PressableProps['onPress']
  disabled?: boolean
  iconStyle?: ViewStyle
  badge?: number
  isLast?: boolean
}) {
  const { styles, theme } = useTheme()
  const {
    Icon,
    label,
    isActive,
    onPress,
    staticColor,
    activeColor,
    iconStyle,
    isLast,
  } = props
  return (
    <Pressable
      className={classNames(
        'w-[52px] h-[52px] rounded-lg items-center justify-center',
        'active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600',
        !isLast && 'mb-1',
      )}
      disabled={props.disabled}
      onPress={(e) => {
        if (isActive) {
          return
        }
        onPress(e)
      }}>
      <View className="relative w-[24px] h-[24px]">
        <Icon
          style={iconStyle}
          size={24}
          color={isActive ? activeColor : staticColor}
        />
        {!!props.badge && (
          <View
            className="absolute top-[-6px] right-[-8px] rounded-md min-w-[12px] px-[3px] text-center border-2 border-solid"
            style={[
              styles.btn_primary__bg,
              {
                borderColor: theme.colors.bg_overlay,
              },
            ]}>
            <Text className="text-[10px]" style={styles.btn_primary__text}>
              {props.badge}
            </Text>
          </View>
        )}
      </View>
      {/* {label && (
        <Text
          className={classNames('text-[10px] mt-1', isActive && 'font-bold')}
          style={{
            color: isActive ? activeColor : staticColor,
          }}>
          {label}
        </Text>
      )} */}
    </Pressable>
  )
}

export default AppSidebarButton
