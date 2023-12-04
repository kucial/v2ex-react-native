import { Linking, Text, View } from 'react-native'
import { MapPinIcon } from 'react-native-heroicons/outline'

import Button from '@/components/Button'
import GithubIcon from '@/components/GithubIcon'
import TwitterIcon from '@/components/TwitterIcon'
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
        <View className="flex flex-row items-center mr-3">
          <MapPinIcon
            size={18}
            style={{ marginRight: 4 }}
            color={styles.text_primary.color}
          />
          <Text style={styles.text}>{data.location}</Text>
        </View>
      )}
      {data.twitter && (
        <Button
          variant="icon"
          size="sm"
          className="flex flex-row items-center mr-2"
          onPress={() => {
            Linking.openURL(`https://twitter.com/${data.twitter}`)
          }}>
          <TwitterIcon size={18} style={{ marginRight: 4 }} />
          <Text style={styles.text}>{data.twitter}</Text>
        </Button>
      )}
      {data.github && (
        <Button
          variant="icon"
          size="sm"
          className="flex flex-row items-center mr-2"
          onPress={() => {
            Linking.openURL(`https://github.com/${data.github}`)
          }}>
          <GithubIcon
            size={18}
            style={{ marginRight: 4 }}
            color={styles.text_primary.color}
          />
          <Text style={styles.text}>{data.github}</Text>
        </Button>
      )}
    </View>
  )
}
