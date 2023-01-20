import Svg, { Path } from 'react-native-svg'
const ToBottomIcon = (props: IconProps) => (
  <Svg viewBox="0 0 18 18" width={props.size} height={props.size}>
    <Path
      strokeWidth={1}
      stroke={props.color}
      d="M9,2.5v13 M9,15.5l6.75-6.75 M9,15.5L2.25,8.75 M1.5,15.5h15"
    />
  </Svg>
)

export default ToBottomIcon
