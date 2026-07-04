import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'

import CheckIcon from '@/components/CheckIcon'

import { getImageLink } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

export default function ImageCard(props) {
  const { data, selected } = props
  const { theme, styles } = useTheme()
  return (
    <Pressable
      style={({ pressed }) => [
        imageCardStyles.wrapper,
        pressed && imageCardStyles.pressed,
      ]}
      onPress={props.onPress}
    >
      <View style={imageCardStyles.imageBox}>
        <View
          style={[
            imageCardStyles.absoluteInset,
            {
              backgroundColor: theme.colors.text_placeholder,
            },
          ]}
        >
          <Image
            source={
              data?.link
                ? {
                    uri: getImageLink(data, 'l'),
                  }
                : require('./assets/image-placeholder.png')
            }
            contentFit='cover'
            style={{
              justifyContent: 'center',
              flex: 1,
            }}
          />
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [
          imageCardStyles.checkBtn,
          pressed && imageCardStyles.pressed,
        ]}
        onPress={(e) => {
          e.stopPropagation()
          props.onToggleSelect()
        }}
      >
        <View
          style={[
            imageCardStyles.checkCircle,
            selected
              ? [imageCardStyles.checkCircleSelected, styles.btn_success__bg]
              : styles.border,
          ]}
        >
          {selected && <CheckIcon size={14} color='white' />}
        </View>
      </Pressable>
    </Pressable>
  )
}

const imageCardStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  pressed: {
    opacity: 0.5,
  },
  imageBox: {
    width: '100%',
    paddingTop: '100%',
    overflow: 'hidden',
  },
  absoluteInset: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  checkBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  checkCircleSelected: {
    borderWidth: 0,
  },
})
