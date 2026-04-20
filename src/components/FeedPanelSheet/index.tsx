import React, { useEffect, useRef } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import HtmlRender from '@/components/HtmlRender'

import { useTheme } from '@/containers/ThemeService'
import { usePanelSheet } from '@/stores/panelSheet'

export default function FeedPanelSheet() {
  const sheetRef = useRef<TrueSheet>(null)
  const { styles } = useTheme()
  const { data, closePanelSheet } = usePanelSheet()
  const { width } = useWindowDimensions()

  if (!data) return null

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[1]}
      initialDetentIndex={0}
      onDidDismiss={closePanelSheet}
      backgroundColor={styles.overlay.backgroundColor}
      scrollable
      grabber={false}
    >
      <ScrollView contentContainerClassName='px-4 pt-4 pb-safe'>
        <View className='py-3 mb-3' style={styles.border_b_light}>
          <Text
            style={[styles.text_title, styles.text_lg, { fontWeight: 'bold' }]}
          >
            {data.title}
          </Text>
        </View>

        <HtmlRender source={{ html: data.content }} contentWidth={width - 32} />
      </ScrollView>
    </TrueSheet>
  )
}
