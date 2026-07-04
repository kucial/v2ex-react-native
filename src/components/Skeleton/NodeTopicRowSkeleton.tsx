import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { BlockText, InlineBox, InlineText } from './Elements'

export default function NodeTopicRowSkeleton() {
  const { styles } = useTheme()
  return (
    <View
      style={[
        nodeSkelStyles.rowContainer,
        styles.layer1,
        styles.border_b_light,
      ]}
    >
      <View style={nodeSkelStyles.leftCol}>
        <InlineBox style={nodeSkelStyles.avatarBox} />
      </View>
      <View style={nodeSkelStyles.mainCol}>
        <BlockText
          style={[styles.text_base, nodeSkelStyles.titleText]}
          lines={[1, 3]}
        />
        <View style={nodeSkelStyles.metaRow}>
          <InlineText style={styles.text_xs} width={[58, 80]} />
        </View>
      </View>

      <View style={nodeSkelStyles.rightCol}>
        <InlineText
          style={[styles.text_xs, nodeSkelStyles.badgeText]}
          width={[18, 32]}
        />
      </View>
    </View>
  )
}

const nodeSkelStyles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  leftCol: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  mainCol: {
    flex: 1,
    position: 'relative',
    top: -2,
  },
  titleText: {
    fontWeight: '500',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 4,
  },
  rightCol: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  badgeText: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    backgroundColor: '#a3a3a3',
  },
})
