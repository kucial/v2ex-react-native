import { Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import useSWR from 'swr'

import Button from '@/components/Button'
import { Box } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'
import { localTime } from '@/utils/time'
import { getMemberDetail } from '@/utils/v2ex-client'

const AVATAR_SIZE = 48

export default function SimpleMemberInfo(props: {
  username: string
  navigation: NativeStackNavigationProp<AppStackParamList>
}) {
  const { username, navigation } = props
  const { styles } = useTheme()
  const memberSwr = useSWR(
    [`/page/member/:username/info.json`, username],
    async ([_, username]) => {
      const { data } = await getMemberDetail({ username })
      return data
    },
    {
      onErrorRetry(err) {
        if (err.response?.status === 404) {
          return
        }
      },
    },
  )

  const { data } = memberSwr

  return (
    <View className="px-2 pt-1 pb-3" style={styles.border_b_light}>
      <View className="flex flex-row">
        <View className="mr-3">
          {data?.avatar_large ? (
            <Image
              className="w-full h-full rounded-md"
              style={[
                {
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                },
                styles.layer2,
              ]}
              source={{ uri: data.avatar_large }}
            />
          ) : (
            <Box
              className="rounded-md"
              style={[
                {
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                },
                styles.layer2,
              ]}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold" style={styles.text_primary}>
            {username}
          </Text>
          <Text className="text-sm" style={styles.text_meta}>
            <Text className="pl-2 mb-1">
              {data?.created ? `${localTime(data.created * 1000)} 加入` : ''}
            </Text>
          </Text>
        </View>
        <View className="flex flex-col justify-center">
          <Button
            size="sm"
            variant="default"
            onPress={() => {
              navigation.navigate('member', {
                username,
              })
            }}
            label="用户主页"></Button>
        </View>
      </View>
    </View>
  )
}
