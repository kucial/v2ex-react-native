import { StyleSheet, Text, View } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'

import { ImgurAlbum, ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import BackButton from '../BackButton'
import Albums from './Albums'
import Images from './Images'
import UploadButton from './UploadButton'

type LandingProps = {
  selected: ImgurImage[]
  tabIndex: number
  setTabIndex(index: number): void
  onCancel(): void
  onSelectAlbum(album: ImgurAlbum): void
  onToggleSelect(image: ImgurImage): void
}
export default function Landing(props: LandingProps) {
  const { tabIndex } = props
  const { theme, styles, colorScheme } = useTheme()

  return (
    <View style={landingStyles.container}>
      <View style={landingStyles.safeWrap}>
        <View style={[landingStyles.headerWrap, styles.border_b]}>
          <View style={landingStyles.headerRow}>
            <View style={landingStyles.sideBox}>
              {props.onCancel && (
                <BackButton
                  tintColor={theme.colors.text}
                  onPress={props.onCancel}
                />
              )}
            </View>
            <View style={landingStyles.titleWrap}>
              <Text
                style={[
                  landingStyles.titleText,
                  styles.text,
                  styles.text_base,
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                Imgur 图床
              </Text>
            </View>
            <View style={landingStyles.sideBoxRight}></View>
          </View>
          <View style={landingStyles.segmentWrap}>
            <SegmentedControl
              values={['图片', '相册']}
              selectedIndex={tabIndex}
              onChange={(event) => {
                props.setTabIndex(event.nativeEvent.selectedSegmentIndex)
              }}
              appearance={colorScheme}
            />
          </View>
        </View>
      </View>
      {tabIndex === 1 && <Albums onSelectAlbum={props.onSelectAlbum} />}
      {tabIndex == 0 && (
        <Images
          selected={props.selected}
          onToggleSelect={props.onToggleSelect}
        />
      )}
      {tabIndex === 0 && (
        <UploadButton tintColor={styles.btn_success__text.color} />
      )}
    </View>
  )
}

const landingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeWrap: {
    // safe area if needed
  },
  headerWrap: {
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 4,
  },
  sideBox: {
    width: 100,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 4,
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  sideBoxRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  segmentWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    position: 'relative',
  },
})
