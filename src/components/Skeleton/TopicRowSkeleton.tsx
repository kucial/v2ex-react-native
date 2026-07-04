import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { BlockText, Box, InlineText } from './Elements'

export default function TopicRowSkeleton() {
  const { styles, theme } = useTheme()
  return (
    <View
      style={[skelStyles.rowContainer, styles.layer1, styles.border_b_light]}
    >
      <View style={skelStyles.mainCol}>
        <View style={skelStyles.metaRow}>
          <Box style={skelStyles.avatarBox} />
          <View>
            <View style={skelStyles.tagBox}>
              <InlineText style={styles.text_xs}></InlineText>
            </View>
          </View>
          <Text
            style={{
              color: theme.colors.skeleton,
            }}
          >
            ·
          </Text>
          <View style={skelStyles.relative}>
            <InlineText width={[56, 80]} style={styles.text_xs}></InlineText>
          </View>
        </View>
        <View style={skelStyles.contentCol}>
          <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
          <View style={skelStyles.mt2}>
            <InlineText width={[80, 120]} style={styles.text_xs}></InlineText>
          </View>
        </View>
      </View>
      <View style={skelStyles.rightCol}>
        <Box style={skelStyles.badgeBox}>
          <InlineText width={8} style={styles.text_xs} />
        </Box>
      </View>
    </View>
  )
}

const skelStyles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCol: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    marginBottom: 4,
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  tagBox: {
    paddingVertical: 2,
    borderRadius: 4,
    width: 50,
  },
  relative: {
    position: 'relative',
  },
  contentCol: {
    paddingLeft: 34,
  },
  mt2: {
    marginTop: 8,
  },
  rightCol: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
})
