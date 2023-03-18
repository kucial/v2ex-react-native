import Svg, { Path } from 'react-native-svg'
const ToBottomIcon = (props: IconProps) => {
  const { size = 24, color, style } = props
  return (
    <Svg viewBox="0 0 18 18" width={size} height={size} style={style}>
      <Path
        strokeWidth={1}
        stroke={color}
        d="M9,2.5v13 M9,15.5l6.75-6.75 M9,15.5L2.25,8.75 M1.5,15.5h15"
      />
    </Svg>
  )
}

export default ToBottomIcon
