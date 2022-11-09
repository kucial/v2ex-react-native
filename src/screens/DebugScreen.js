import { useCallback, useMemo, useRef } from 'react'
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Dimensions } from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import HTML, { CustomTextualRenderer } from 'react-native-render-html'
import { SelectableText } from '@alentoma/react-native-selectable-text'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

import HtmlRender from '@/components/HtmlRender'
import { useSWR } from '@/utils/swr'

import TopicInfo from './TopicScreen/TopicInfo'

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

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], [])

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index)
  }, [])
  const { width } = useWindowDimensions()

  // renders
  // return null
  return (
    <SafeAreaView style={styles.container}>
      {[...new Array(10)].map((_, index) => (
        <View
          key={index}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}>
          {/* <View>
            <TextInput
              style={{
                fontSize: 16,
                lineHeight: 20,
              }}
              value="一台高性能主机，供客厅以及各个房间使用，如果真的可以这样做，键盘鼠标视频布线该怎么办"
              scrollEnabled={false}
              multiline
            />
          </View> */}
          {topicSwr && (
            <HtmlRender
              contentWidth={width - 32}
              source={{
                html: topicSwr.data.content_rendered,
              }}
            />
          )}
        </View>
      ))}
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
