import { ReactElement } from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function ErrorNotice(props: {
  error: Error
  extra?: ReactElement
  style?: ViewStyle
}) {
  const { styles } = useTheme()

  return (
    <View
      style={[errorNoticeStyles.container, props.style, styles.layer2]}
    >
      <View style={errorNoticeStyles.centerRow}>
        <Text style={[errorNoticeStyles.messageText, styles.text]}>
          {props.error.message}
        </Text>
      </View>
      {props.extra}
    </View>
  )
}

const errorNoticeStyles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingVertical: 20,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    marginVertical: 12,
    textAlign: 'center',
  },
})
