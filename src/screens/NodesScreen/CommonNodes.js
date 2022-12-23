import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import { useTheme } from '@/containers/ThemeService'

export default function Nodes({ data }) {
  const navigation = useNavigation()
  const { styles, theme } = useTheme()

  return (
    <View className="flex flex-row flex-wrap py-2 px-3">
      {data.map((node) => {
        return (
          <Pressable
            key={node.name}
            className={classNames(
              'py-2 px-2 rounded-lg mr-2 mb-2 active:opacity-60',
            )}
            style={[styles.layer2, styles.border]}
            onPress={() => {
              navigation.navigate('node', {
                name: node.name,
              })
            }}>
            <Text style={styles.text}>{node.title}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
