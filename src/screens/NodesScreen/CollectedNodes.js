import { Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { DocumentIcon } from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

export default function CollectedNodes(props) {
  const navigation = useNavigation()
  const { data } = props

  return (
    <View className="flex flex-row flex-wrap px-1 py-2">
      {data.map((node) => (
        <View key={node.name} className="basis-1/2 px-1 py-1">
          <Pressable
            className={classNames(
              'py-2 px-2 bg-white border border-neutral-400 rounded-lg',
              'dark:bg-neutral-800 dark:border-neutral-700',
              'flex flex-row items-center',
              'active:opacity-60',
            )}
            onPress={() => {
              navigation.navigate('node', {
                name: node.name,
              })
            }}>
            <FastImage
              className="w-[44px] h-[44px]"
              source={{ uri: node.avatar_large }}></FastImage>
            <View className="ml-3 pt-1">
              <Text className="text-neutral-900 dark:text-neutral-300">
                {node.title}
              </Text>
              <View className="mt-1 flex flex-row items-center">
                <View className="mr-1">
                  <DocumentIcon size={12} color="#9ca3af" />
                </View>
                <Text className="text-xs text-neutral-400">{node.topics}</Text>
              </View>
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  )
}
