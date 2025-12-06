// CodeBlock.tsx
import React from 'react'
import { ScrollView } from 'react-native'
import {
  CustomRendererProps,
  getNativePropsForTNode,
  TBlock,
} from 'react-native-render-html'

export default function PreRenderer(props: CustomRendererProps<TBlock>) {
  const renderProps = getNativePropsForTNode(props)

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      style={renderProps.style}
      contentContainerClassName='px-2'
    >
      {renderProps.children}
    </ScrollView>
  )
}
