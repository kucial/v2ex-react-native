import { Pressable, Text, View } from 'react-native'
import { DocumentIcon } from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useTheme } from '@/containers/ThemeService'
import { NodeExtra } from '@/utils/v2ex-client/types'

export default function CollectedNodes(props: { data: NodeExtra[] }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { data } = props
  const { theme, styles } = useTheme()

  return (
    <MaxWidthWrapper>
      <View className="px-1">
        <View
          style={styles.layer1}
          className="flex flex-row flex-wrap px-1 py-2">
          {data.map((node) => (
            <View key={node.name} className="basis-1/2 px-1 py-1">
              <Pressable
                className={classNames(
                  'py-2 px-2 rounded-lg',
                  'flex flex-row items-center',
                  'active:opacity-60',
                )}
                style={[styles.layer2]}
                onPress={() => {
                  navigation.navigate('node', {
                    name: node.name,
                  })
                }}>
                <Image
                  className="w-[44px] h-[44px]"
                  source={{ uri: node.avatar_large }}></Image>
                <View className="ml-3 pt-1">
                  <Text style={styles.text}>{node.title}</Text>
                  <View className="mt-1 flex flex-row items-center">
                    <View className="mr-1">
                      <DocumentIcon size={12} color={theme.colors.text_meta} />
                    </View>
                    <Text className="text-xs" style={styles.text_meta}>
                      {node.topics}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </MaxWidthWrapper>
  )
}
