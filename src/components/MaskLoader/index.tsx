import { View, ViewStyle } from 'react-native'

import Loader from '@/components/Loader'

export default function MaskLoader(props: { style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        props.style,
      ]}>
      <Loader />
    </View>
  )
}
