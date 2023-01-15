import Svg, { Path } from 'react-native-svg'

export default function ReplyIcon({ size = 24, color }: IconProps) {
  return (
    <Svg
      fill="none"
      viewBox={`0 0 24 24`}
      width={size}
      height={size}
      stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </Svg>
  )
}
