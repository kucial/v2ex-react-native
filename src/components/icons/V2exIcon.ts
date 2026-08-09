import { type ComponentProps, type FC } from 'react'
import * as CommonNS from '@react-native-vector-icons/common'

import glyphMap from './glyphmaps/V2exIcons.json'

export type V2exIconName = keyof typeof glyphMap

const Icon = CommonNS.createIconSet(glyphMap, {
  postScriptName: 'V2exIcons',
  fontFileName: 'V2exIcons.ttf',
  fontSource: require('../../assets/fonts/V2exIcons.ttf'),
})

type V2exIconProps = Omit<ComponentProps<typeof Icon>, 'size'> & {
  size: number
}

type V2exIconComponent = FC<V2exIconProps> &
  Pick<typeof Icon, 'getImageSource' | 'getImageSourceSync'>

// Unlike the underlying library component, every app usage must choose a size.
export default Icon as V2exIconComponent
