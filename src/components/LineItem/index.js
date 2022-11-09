import { Pressable, Text, View } from 'react-native'
import classNames from 'classnames'
export const LineItemGroup = (props) => {
  return (
    <View
      className="mx-4 my-3 overflow-hidden rounded-lg shadow-xs"
      style={props.style}>
      {props.children}
    </View>
  )
}

export const LineItem = (props) => {
  return (
    <Pressable
      className={classNames(
        'min-h-[50px] bg-white active:opacity-50 flex flex-row items-center pl-4',
        'dark:bg-neutral-900',
      )}
      onPress={props.onPress}
      disabled={props.disabled}>
      <View
        className={classNames('h-full flex-1 flex flex-row', {
          'border-b border-b-neutral-300 dark:border-neutral-600':
            !props.isLast,
        })}>
        <View className="flex-1 flex flex-row items-center">
          {props.icon && <View className="mr-3">{props.icon}</View>}
          <Text className="text-base dark:text-neutral-300">{props.title}</Text>
        </View>
        {props.extra && (
          <View className="h-full flex flex-row items-center pr-3">
            {props.extra}
          </View>
        )}
      </View>
    </Pressable>
  )
}
