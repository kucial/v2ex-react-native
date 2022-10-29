import { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

export default function Nodes({ data }) {
  const navigation = useNavigation()

  return (
    <View className="flex flex-row flex-wrap py-2 px-3">
      {data.map((node) => {
        return (
          <Pressable
            key={node.name}
            className={classNames(
              'py-2 px-2 bg-white border border-neutral-400 rounded-lg mr-2 mb-2 active:opacity-60 dark:bg-neutral-800 dark:border-neutral-600'
            )}
            onPress={() => {
              navigation.navigate('node', {
                name: node.name
              })
            }}>
            <Text className="text-neutral-800 dark:text-neutral-300">
              {node.title}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
