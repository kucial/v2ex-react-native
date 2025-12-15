import React from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { useTheme } from '@/containers/ThemeService'
import { getAbsoluteUrl } from '@/utils/url'
import { PlanetInfo } from '@/utils/v2ex-client/types'

type PlanetSiteHeaderProps = {
  siteInfo: PlanetInfo
}

export default function PlanetSiteHeader({ siteInfo }: PlanetSiteHeaderProps) {
  const { styles } = useTheme()

  return (
    <MaxWidthWrapper style={[styles.layer1, { marginBottom: 4 }]}>
      <View className='p-2' style={[styles.border_b_light]}>
        <View className='rounded-lg'>
          <View className='flex flex-row'>
            {siteInfo.avatar ? (
              <Image
                className='w-[60px] h-[60px] mr-3 rounded-lg'
                source={{
                  uri: getAbsoluteUrl(siteInfo.avatar),
                }}
              />
            ) : (
              <View
                className='w-[60px] h-[60px] mr-3 rounded-lg'
                style={styles.layer3}
              />
            )}

            <View className='flex-1'>
              <View className='flex flex-row justify-between items-center mb-1'>
                <View>
                  <Text
                    className='font-semibold'
                    style={[styles.text, styles.text_lg]}
                  >
                    {siteInfo.site_title}
                  </Text>
                </View>
              </View>

              {siteInfo.links && siteInfo.links.length > 0 && (
                <View className='flex flex-row flex-wrap'>
                  {siteInfo.links.map((link, index) => (
                    <Pressable
                      className='px-2 py-1 mb-1 rounded active:opacity-50'
                      style={[styles.layer2]}
                      key={link.href}
                      onPress={() => {
                        Linking.openURL(link.href)
                      }}
                    >
                      <Text className='text-xs'>
                        <Text>🔗 </Text>
                        <Text style={styles.text_meta}>{link.text}</Text>
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </MaxWidthWrapper>
  )
}
