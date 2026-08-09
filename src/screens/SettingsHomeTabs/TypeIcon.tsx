import V2exIcon from '@/components/icons/V2exIcon'

type TabType = 'home' | 'node' | 'user'
export default function TypeIcon({
  type,
  ...props
}: IconProps & { type: TabType; size: number }) {
  switch (type) {
    case 'home':
      return <V2exIcon name='home-modern-outline' {...props} />
    case 'node':
      return <V2exIcon name='rectangle-stack-outline' {...props} />
    case 'user':
      return <V2exIcon name='user-outline' {...props} />
  }
}
