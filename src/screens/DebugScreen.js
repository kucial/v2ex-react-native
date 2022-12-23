import { useCallback, useMemo, useRef } from 'react'
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Dimensions } from 'react-native'
import { SelectableText } from '@alentoma/react-native-selectable-text'
import { NativeWindStyleSheet } from 'nativewind'

import ErrorNoticeView from '@/components/ErrorBoundary/ErrorNoticeView'
import ErrorNotice from '@/components/ErrorNotice'
import Loader from '@/components/Loader'
import { useTheme } from '@/containers/ThemeService'

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

const INDICATOR_WIDTH = 64
const INDICATOR_HEIGHT = 64

export default function DebugScreen(props) {
  // ref
  const { theme, styles } = useTheme()
  const { width, height } = useWindowDimensions()

  // renders
  // return null

  return (
    <View style={{ backgroundColor: theme.colors.bg_layer1, flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Pressable
          className="px-4 h-[44px] w-[120px] rounded-full items-center justify-center active:opacity-60"
          style={{
            backgroundColor: theme.colors.primary,
          }}>
          <Text style={{ color: theme.colors.text_primary_inverse }}>重试</Text>
        </Pressable>

        <ErrorNotice error={new Error('Debug')} />

        <View className="dark:bg-rose-600/10">
          <Text style={styles.text}>11123123123</Text>
        </View>
      </SafeAreaView>
    </View>
  )
}
