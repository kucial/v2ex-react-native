import * as CommonNS from '@react-native-vector-icons/common'

import glyphMap from './glyphmaps/V2exIcons.json'

export type V2exIconName = keyof typeof glyphMap

const Icon = CommonNS.createIconSet(glyphMap, {
  postScriptName: 'V2exIcons',
  fontFileName: 'V2exIcons.ttf',
  fontSource: require('../../assets/fonts/V2exIcons.ttf'),
})

export default Icon
