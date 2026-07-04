import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

export default function SectionHeader(props: {
  title: string
  desc?: string
  secondary?: ReactNode
}) {
  const { styles } = useTheme()
  return (
    <View style={secHeaderStyles.container}>
      <Text style={[secHeaderStyles.titleText, styles.text, styles.text_base]}>
        {props.title}
      </Text>
      {!!props.desc && (
        <Text
          style={[secHeaderStyles.descText, styles.text_desc, styles.text_xs]}
        >
          {props.desc}
        </Text>
      )}
      {props.secondary}
    </View>
  )
}

const secHeaderStyles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 4,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  titleText: {
    fontWeight: '500',
  },
  descText: {
    marginLeft: 8,
    marginBottom: 2,
  },
})
