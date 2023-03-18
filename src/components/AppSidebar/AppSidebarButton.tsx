import {
  ColorValue,
  Pressable,
  PressableProps,
  Text,
  ViewStyle,
} from 'react-native'
import { HomeIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'

function AppSidebarButton(props: {
  Icon: typeof HomeIcon
  label: string
  isActive: boolean
  staticColor: ColorValue
  activeColor: ColorValue
  onPress: PressableProps['onPress']
  disabled?: boolean
  iconStyle?: ViewStyle
}) {
  const {
    Icon,
    label,
    isActive,
    onPress,
    staticColor,
    activeColor,
    iconStyle,
  } = props
  return (
    <Pressable
      className={classNames(
        'w-[52px] h-[52px] rounded-lg items-center justify-center',
        'active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600',
        'mb-2',
      )}
      disabled={props.disabled}
      onPress={(e) => {
        if (isActive) {
          return
        }
        onPress(e)
      }}>
      <Icon
        style={iconStyle}
        size={24}
        color={isActive ? activeColor : staticColor}
      />
      {label && (
        <Text
          className={classNames('text-[10px] mt-1', isActive && 'font-bold')}
          style={{
            color: isActive ? activeColor : staticColor,
          }}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export default AppSidebarButton
