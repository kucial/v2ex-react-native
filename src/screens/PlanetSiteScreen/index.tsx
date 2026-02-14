import React, { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useLocalSearchParams } from 'expo-router'

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

  const [isFocused] = useState(true) // TODO: handle focus state properly

  if (error) {
    return (
      <View className='flex-1'>
        <AnimatedHeader
          title={site_address || 'Planet Site'}
          scrollY={scrollY}
        />
        <View className='flex-1 items-center justify-center'>
          <Text>{error.message}</Text>
        </View>
      </View>
    )
  }

  if (isLoading || !siteInfo) {
    return (
      <View className='flex-1'>
        <AnimatedHeader
          title={site_address || 'Planet Site'}
          scrollY={scrollY}
        />
        <View className='flex-1 items-center justify-center'>
          <Loader />
        </View>
      </View>
    )
  }

  return (
    <View className='flex-1'>
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
