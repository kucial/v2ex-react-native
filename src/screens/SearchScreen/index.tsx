import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { useAppSettings } from '@/containers/AppSettingsService'

import GoogleSearch from './GoogleSearch'
import Sov2exSearch from './Sov2exSearch'
type ScreenProps = NativeStackScreenProps<AppStackParamList, 'search'>

export default function SearchScreen(props: ScreenProps) {
  const {
    data: { searchProvider },
  } = useAppSettings()

  if (searchProvider === 'sov2ex') {
    return <Sov2exSearch {...props} />
  }

  return <GoogleSearch {...props} />
}
