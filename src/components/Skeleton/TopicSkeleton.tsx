import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import MaxWidthWrapper from '../MaxWidthWrapper'
import { BlockText, Box, InlineBox, InlineText } from './Elements'

export default function TopicSkeleton() {
  const { styles } = useTheme()
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <View style={topSkelStyles.container}>
        <View style={topSkelStyles.headerRow}>
          <View style={topSkelStyles.authorCol}>
            <InlineBox style={topSkelStyles.avatarBox} />
            <View style={topSkelStyles.authorMeta}>
              <View style={topSkelStyles.py2}>
                <InlineText style={topSkelStyles.fontMedium} width={[60, 80]} />
              </View>
              <View style={topSkelStyles.ml2}>
                <InlineText style={styles.text_xs} width={[40, 60]} />
              </View>
            </View>
          </View>
          <View>
            <InlineBox
              style={topSkelStyles.nodeBox}
              width={[48, 72]}
            ></InlineBox>
          </View>
        </View>
        <View style={[topSkelStyles.titleContainer, styles.border_b_light]}>
          <BlockText style={styles.text_lg} lines={[1, 3]} />
        </View>
        <View style={topSkelStyles.mt1}>
          <BlockText lines={[5, 10]} />
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

const topSkelStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  authorCol: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  authorMeta: {
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  py2: {
    paddingVertical: 2,
  },
  fontMedium: {
    fontWeight: '500',
  },
  ml2: {
    marginLeft: 8,
  },
  nodeBox: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  titleContainer: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  mt1: {
    marginTop: 4,
  },
})
