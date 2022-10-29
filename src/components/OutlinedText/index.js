import Svg, { Text } from 'react-native-svg'

export default function OutlinedText(props) {
  const { width, height, fontSize } = props
  return (
    <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
      <Text
        strokeWidth="1"
        stroke={props.outlineColor}
        fill={props.color}
        fontWeight="bold"
        fontSize={fontSize}
        x={2}
        y={height - 5}>
        {props.text}
      </Text>
    </Svg>
  )
}
