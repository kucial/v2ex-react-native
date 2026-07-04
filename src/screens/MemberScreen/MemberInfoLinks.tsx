import { StyleSheet, Text, View } from 'react-native'
import { MapPinIcon } from 'react-native-heroicons/outline'
import * as Sentry from '@sentry/react-native'
import * as WebBrowser from 'expo-web-browser'

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
    <View style={linkStyles.row}>
      {data.location && (
        <View style={linkStyles.locationWrap}>
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
          variant='icon'
          size='sm'
          style={linkStyles.btnWrap}
          onPress={() => {
            const url = `https://twitter.com/${data.twitter}`
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.captureException(err)
            })
          }}
        >
          <TwitterIcon size={18} style={{ marginRight: 4 }} />
          <Text style={styles.text}>{data.twitter}</Text>
        </Button>
      )}
      {data.github && (
        <Button
          variant='icon'
          size='sm'
          style={linkStyles.btnWrap}
          onPress={() => {
            const url = `https://github.com/${data.github}`
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.captureException(err)
            })
          }}
        >
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

const linkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: -8,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingLeft: 8,
  },
  btnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
})
