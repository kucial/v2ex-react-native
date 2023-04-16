import { useEffect } from 'react'
import { Linking } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import { useAlertService } from '../AlertService'

export default function ClipboardWatcher(props) {
  const alert = useAlertService()
  useEffect(() => {
    const subscription = Clipboard.addClipboardListener(({ contentTypes }) => {
      if (contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
        Clipboard.getUrlAsync().then((url) => {
          if (url) {
            alert.show({
              type: 'info',
              message: `点击打开链接：${url}`,
              onPress() {
                Linking.openURL(url)
              },
              duration: 3000,
            })
          }
        })
      }
    })
    return () => {
      Clipboard.removeClipboardListener(subscription)
    }
  }, [alert])
  return props.children
}
