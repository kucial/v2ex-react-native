import type { ReactNode } from 'react'
import type { ViewProps, ViewStyle } from 'react-native'
import { View } from 'react-native'

import { cn } from '@/lib/utils'

const GroupWapper = (props: {
  className?: string
  children: ReactNode
  innerStyle?: ViewStyle | ViewStyle[]
  style?: ViewStyle
  pointerEvents?: ViewProps['pointerEvents']
}) => {
  return (
    <View
      className={cn('flex-1', props.className)}
      style={props.style}
      pointerEvents={props.pointerEvents}
    >
      <View
        className='flex-1 w-full rounded-lg overflow-hidden'
        style={props.innerStyle}
      >
        {props.children}
      </View>
    </View>
  )
}

export default GroupWapper
