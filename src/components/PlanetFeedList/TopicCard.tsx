import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  ArrowsPointingOutIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from 'react-native-heroicons/outline'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

import { useTheme } from '@/containers/ThemeService'
import { usePanelSheet } from '@/stores/panelSheet'

import AudioPlayer from '../AudioPlayer'
import HtmlRender from '../HtmlRender'
import MaxWidthWrapper from '../MaxWidthWrapper'

function TopicCard(props: PlanetFeedRowProps & { contentWidth?: number }) {
  const {
    data,
    showAvatar,
    titleStyle,
    variant = 'feed',
    contentWidth: propContentWidth,
  } = props
  const router = useRouter()
  const { styles, theme } = useTheme()
  const iconColor = theme.colors.text_meta
  const { openPanelSheet } = usePanelSheet()

  const showPlanetInfo = showAvatar && variant === 'feed'
  const isTitlePressable = variant === 'feed'

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={cardStyles.skeletonRow}>
          <View style={cardStyles.skeletonBody}>
            <View style={cardStyles.skeletonHeader}>
              {showPlanetInfo && <Box style={cardStyles.avatarBox} />}
              <View>
                <View style={cardStyles.tagSkeleton}>
                  <InlineText style={styles.text_xs}></InlineText>
                </View>
              </View>
              <View style={cardStyles.mx1}></View>
              <View>
                <InlineText
                  width={[56, 80]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
            <View
              style={[
                showPlanetInfo && cardStyles.pl34,
                cardStyles.bodyContent,
              ]}
            >
              <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
              <View style={cardStyles.mt2}>
                <InlineText
                  width={[80, 120]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { title, planet } = props.data

  const handleTitlePress = () => {
    props.onView?.(data.url || data.uuid)
    openPanelSheet(data)
  }

  const handlePlanetPress = () => {
    router.push({
      pathname: '/planet/[site_address]' as never,
      params: {
        site_address: planet.site_address,
      },
    })
  }

  return (
    <MaxWidthWrapper style={[styles.layer1, cardStyles.wrapper]}>
      <View sentry-label='TopicRow' style={[cardStyles.row, styles.layer1]}>
        {showPlanetInfo ? (
          <View style={cardStyles.avatarContainer}>
            <FixedPressable
              style={({ pressed }) => pressed && cardStyles.pressed50}
              onPress={handlePlanetPress}
            >
              <Image
                recyclingKey={`site_avatar:${planet.site_address}`}
                source={{
                  uri: planet.avatar,
                }}
                style={cardStyles.avatarImage}
              />
            </FixedPressable>
          </View>
        ) : (
          <View style={cardStyles.pl3}></View>
        )}

        <View
          style={[
            cardStyles.centerContent,
            props.viewedStatus === 'viewed' && cardStyles.viewedOpacity,
          ]}
        >
          <View style={cardStyles.headerRow}>
            {showPlanetInfo && (
              <View>
                <FixedPressable
                  hitSlop={4}
                  style={({ pressed }) => [
                    cardStyles.planetPressable,
                    styles.layer2,
                    pressed && cardStyles.pressed60,
                  ]}
                  onPress={handlePlanetPress}
                >
                  <Text style={[styles.text_desc, styles.text_xs]}>
                    {planet.site_title}
                  </Text>
                </FixedPressable>
              </View>
            )}
            {showPlanetInfo && (
              <View style={cardStyles.mx1}>
                <Text>·</Text>
              </View>
            )}
            <View>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {data.updated_at}
              </Text>
            </View>
          </View>
          <View style={cardStyles.bodyContent}>
            {title &&
              (isTitlePressable ? (
                <Pressable onPress={handleTitlePress}>
                  <Text
                    style={[
                      styles.text,
                      styles.text_base,
                      titleStyle === 'emphasized' && cardStyles.font500,
                    ]}
                  >
                    {title}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  style={[
                    styles.text,
                    styles.text_base,
                    titleStyle === 'emphasized' && cardStyles.font500,
                  ]}
                >
                  {title}
                </Text>
              ))}
            {data.expand_label ? (
              <Pressable
                style={({ pressed }) => [
                  styles.layer2,
                  cardStyles.expandPressable,
                  pressed && cardStyles.pressed50,
                ]}
                onPress={handleTitlePress}
              >
                <Text style={[styles.text_base, styles.text_meta]}>
                  {data.expand_label}
                </Text>

                <View style={cardStyles.expandIcon}>
                  <ArrowsPointingOutIcon color={iconColor} size={16} />
                </View>
              </Pressable>
            ) : (
              <HtmlRender
                source={{ html: data.content }}
                contentWidth={propContentWidth || 300}
              />
            )}
            {data.audio && (
              <View style={cardStyles.my1}>
                <AudioPlayer
                  audio={{
                    title: data.audio.title || title || 'Audio',
                    url: data.audio.url,
                    artist: data.audio.author || data.planet.site_title,
                  }}
                />
              </View>
            )}
            <View style={cardStyles.statsRow}>
              <View style={cardStyles.statItem}>
                <ChatBubbleLeftIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.comment_count}
                </Text>
              </View>
              <View style={cardStyles.statItem}>
                <HeartIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.liked_count}
                </Text>
              </View>
              <View style={cardStyles.statItem}>
                <ChartBarIcon size={14} color={iconColor} />
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.stats_num}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

const cardStyles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonBody: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    marginBottom: 4,
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  tagSkeleton: {
    paddingVertical: 2,
    borderRadius: 4,
    width: 50,
  },
  mx1: {
    marginHorizontal: 4,
  },
  bodyContent: {
    paddingRight: 16,
  },
  pl34: {
    paddingLeft: 34,
  },
  mt2: {
    marginTop: 8,
  },
  wrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  pl3: {
    paddingLeft: 12,
  },
  centerContent: {
    flex: 1,
    paddingVertical: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 4,
  },
  planetPressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  font500: {
    fontWeight: '500',
  },
  expandPressable: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 'auto',
    marginRight: 4,
  },
  my1: {
    marginVertical: 4,
  },
  statsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 48,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed50: {
    opacity: 0.5,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default memo(TopicCard)
