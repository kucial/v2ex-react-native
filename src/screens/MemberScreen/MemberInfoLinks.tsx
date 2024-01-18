import { Text, View } from 'react-native'
import { MapPinIcon } from 'react-native-heroicons/outline'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from 'sentry-expo'

import Button from '@/components/Button'
import GithubIcon from '@/components/GithubIcon'
import TwitterIcon from '@/components/TwitterIcon'
import { useTheme } from '@/containers/ThemeService'
import { MemberDetail } from '@/utils/v2ex-client/types'

export default function MemberInfoLinks(props: { data: MemberDetail }) {
  const { styles, theme } = useTheme()
  const { data } = props
  if (!data) {
    return null
  }
  return (
    <View className="flex flex-row -ml-2">
      {data.location && (
        <View className="flex flex-row items-center mr-3 pl-2">
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
            const url = `https://twitter.com/${data.twitter}`
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.Native.captureException(err)
            })
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
            const url = `https://github.com/${data.github}`
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.Native.captureException(err)
            })
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
