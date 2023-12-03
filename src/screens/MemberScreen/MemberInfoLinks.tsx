import { Text, View } from 'react-native'
import { MapPinIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'
import { MemberDetail } from '@/utils/v2ex-client/types'

export default function MemberInfoLinks(props: { data: MemberDetail }) {
  const { styles } = useTheme()
  const { data } = props
  if (!data) {
    return null
  }
  return (
    <View className="flex flex-row">
      {data.location && (
        <View className="flex flex-row items-center mr-1">
          <MapPinIcon
            size={18}
            style={{ marginRight: 3 }}
            color={styles.text_primary.color}
          />
          <Text style={styles.text}>{data.location}</Text>
        </View>
      )}
      {/* {data.twitter && (
        <View className="flex flex-row items-center mr-1">
          <TwitterIcon
            size={18}
            style={{ marginRight: 3 }}
            color={styles.text_primary.color}
          />
          <Text style={styles.text}>{data.twitter}</Text>
        </View>
      )} */}
    </View>
  )
}
