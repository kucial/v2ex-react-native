import { useCallback, useMemo, useRef } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { Dimensions } from 'react-native'
import { SelectableText } from '@alentoma/react-native-selectable-text'

import HtmlRender from '@/components/HtmlRender'
import { useSWR } from '@/utils/swr'

const fSize = 30
var p = {
  lineHeight: fSize * 1.7,
  fontSize: fSize,
  color: 'white',
  paddingBottom: 5,
  textAlign: 'left',
}

var classes = {
  paddingLeft: fSize * 0.9,
  paddingRight: fSize * 0.95,
  backgroundColor: 'black',
  minWidth: Dimensions.get('window').width,
  minHeight: Dimensions.get('window').height,
  maxWidth: '99%',
  overflow: 'hidden',
  flex: 1,
}

function DivRenderer({ TDefaultRenderer, ...props }) {
  var txt = ''
  Array.from(props.tnode.domNode?.children ?? []).forEach((x) => {
    if (x.data) txt = x.data
  })

  return (
    <SelectableText
      textComponentProps={{ multiline: true }}
      menuItems={['Replace', 'Cancel']}
      onSelection={(...args) => {
        console.log('...onSelection...')
        console.log(...args)
      }}
      highlightColor={'red'}
      highlights={[{ start: 0, end: 10, id: 'test' }]}
      style={p}
      value={txt}
    />
  )
}

export default function DebugScreen() {
  // ref
  const bottomSheetModalRef = useRef(null)
  const id = 893807
  const topicSwr = useSWR(`/api/topics/show.json?id=${id}`)

  const { width } = useWindowDimensions()

  console.log(topicSwr.data)

  // renders
  // return null
  return (
    <SafeAreaView style={styles.container}>
      {topicSwr?.data && (
        <HtmlRender
          contentWidth={width - 32}
          source={{
            html: topicSwr.data.content_rendered,
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // padding: 24,
    backgroundColor: 'transparent',
    // position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
