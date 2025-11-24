import { useAppSettings } from '@/containers/AppSettingsService'

import GoogleSearch from './GoogleSearch'
import Sov2exSearch from './Sov2exSearch'

export default function SearchScreen() {
  const {
    data: { searchProvider },
  } = useAppSettings()

  if (searchProvider === 'sov2ex') {
    return <Sov2exSearch />
  }

  return <GoogleSearch />
}
