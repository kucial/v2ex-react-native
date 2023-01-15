import {
  HomeModernIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'

type TabType = 'home' | 'node' | 'user'
export default function TypeIcon({
  type,
  ...props
}: IconProps & { type: TabType }) {
  switch (type) {
    case 'home':
      return <HomeModernIcon {...props} />
    case 'node':
      return <RectangleStackIcon {...props} />
    case 'user':
      return <UserIcon {...props} />
  }
}
