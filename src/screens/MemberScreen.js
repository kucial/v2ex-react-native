import { View, Text } from 'react-native'
import React from 'react'

export default function MemberScreen({ route }) {
  const { username } = route.params

  return (
    <View>
      <Text>MemberScreen {username}</Text>
    </View>
  )
}
