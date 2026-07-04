import React from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
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
    <MaxWidthWrapper style={{ ...styles.layer1, marginBottom: 4 }}>
      <View style={[planetStyles.p2, styles.border_b_light]}>
        <View style={planetStyles.rounded8}>
          <View style={planetStyles.row}>
            {siteInfo.avatar ? (
              <Image
                style={planetStyles.avatar}
                source={{
                  uri: getAbsoluteUrl(siteInfo.avatar),
                }}
              />
            ) : (
              <View style={[planetStyles.avatar, styles.layer3]} />
            )}

            <View style={planetStyles.flex1}>
              <View style={planetStyles.titleRow}>
                <View>
                  <Text
                    style={[
                      planetStyles.fontSemiBold,
                      styles.text,
                      styles.text_lg,
                    ]}
                  >
                    {siteInfo.site_title}
                  </Text>
                </View>
              </View>

              {siteInfo.links && siteInfo.links.length > 0 && (
                <View style={planetStyles.linksWrap}>
                  {siteInfo.links.map((link, index) => (
                    <Pressable
                      style={({ pressed }) => [
                        planetStyles.linkBtn,
                        styles.layer2,
                        pressed && planetStyles.pressed,
                      ]}
                      key={link.href}
                      onPress={() => {
                        Linking.openURL(link.href)
                      }}
                    >
                      <Text style={styles.text_xs}>
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

const planetStyles = StyleSheet.create({
  p2: {
    padding: 8,
  },
  rounded8: {
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  flex1: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fontSemiBold: {
    fontWeight: '600',
  },
  linksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.5,
  },
})
