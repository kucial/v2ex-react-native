import React, { useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useLocalSearchParams } from 'expo-router'
import { useIsFocused } from 'expo-router/react-navigation'

import AnimatedHeader from '@/components/AnimatedHeader'
import Loader from '@/components/Loader'
import PlanetSiteHeader from '@/components/PlanetSiteHeader'

import { usePlanetInfo } from '@/hooks'

import PlanetSiteFeedList from './PlanetSiteFeedList'

export default function PlanetSiteScreen() {
  const { site_address } = useLocalSearchParams<{ site_address: string }>()
  const { data: siteInfo, isLoading, error } = usePlanetInfo(site_address)
  const currentListRef = useRef<any>(null)
  const scrollY = useSharedValue(0)
  const isFocused = useIsFocused()

  if (error) {
    return (
      <View style={planetSiteStyles.container}>
        <AnimatedHeader
          title={site_address || 'Planet Site'}
          scrollY={scrollY}
        />
        <View style={planetSiteStyles.center}>
          <Text>{error.message}</Text>
        </View>
      </View>
    )
  }

  if (isLoading || !siteInfo) {
    return (
      <View style={planetSiteStyles.container}>
        <AnimatedHeader
          title={site_address || 'Planet Site'}
          scrollY={scrollY}
        />
        <View style={planetSiteStyles.center}>
          <Loader />
        </View>
      </View>
    )
  }

  return (
    <View style={planetSiteStyles.container}>
      <AnimatedHeader title={siteInfo.data.site_title} scrollY={scrollY} />
      <PlanetSiteFeedList
        address={site_address}
        isFocused={isFocused}
        currentListRef={currentListRef}
        header={<PlanetSiteHeader siteInfo={siteInfo.data} />}
        scrollY={scrollY}
      />
    </View>
  )
}

const planetSiteStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
