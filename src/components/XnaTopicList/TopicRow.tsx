import { memo } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

import { useTheme } from '@/containers/ThemeService'

import MaxWidthWrapper from '../MaxWidthWrapper'

function TopicRow(props: XnaFeedRowProps) {
  const { data, showAvatar, titleStyle } = props
  const router = useRouter()
  const { styles, theme } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, styles.border_b_light]}>
          <View style={rowStyles.skeletonBody}>
            <View style={rowStyles.skeletonHeader}>
              {showAvatar && <Box style={rowStyles.avatarBox} />}
              <View>
                <View style={rowStyles.tagSkeleton}>
                  <InlineText style={styles.text_xs}></InlineText>
                </View>
              </View>
              <View style={rowStyles.mx1}></View>
              <View>
                <InlineText
                  width={[56, 80]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
            <View style={rowStyles.pl34}>
              <BlockText lines={[1, 3]} style={styles.text_base}></BlockText>
              <View style={rowStyles.mt2}>
                <InlineText
                  width={[80, 120]}
                  style={styles.text_xs}
                ></InlineText>
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}>
            <Box style={rowStyles.badgeBox}>
              <InlineText width={8} style={styles.text_xs} />
            </Box>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { source, member, title, url } = props.data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TopicRow'
        style={({ pressed }) => [
          rowStyles.mainPressable,
          styles.layer1,
          styles.border_b_light,
          pressed && rowStyles.pressed50,
        ]}
        onPress={() => {
          props.onView(url)
          if (Platform.OS == 'ios') {
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.captureException(err)
            })
          } else {
            router.push({
              pathname: '/browser',
              params: {
                url,
              },
            })
          }
        }}
      >
        <View style={rowStyles.mainPressableContent}>
          {showAvatar ? (
            <View style={rowStyles.avatarContainer}>
              <FixedPressable
                onPress={() => {
                  router.push({
                    pathname: '/member/[username]',
                    params: {
                      username: member.username,
                    },
                  })
                }}
              >
                <Image
                  recyclingKey={`user-avatar:${member.username}`}
                  source={{
                    uri: member.avatar_normal,
                  }}
                  style={rowStyles.avatarImage}
                />
              </FixedPressable>
            </View>
          ) : (
            <View style={rowStyles.pl3}></View>
          )}

          <View
            style={[
              rowStyles.centerContent,
              props.viewedStatus === 'viewed' && rowStyles.viewedOpacity,
            ]}
          >
            <View style={rowStyles.headerRow}>
              <View>
                <FixedPressable
                  hitSlop={4}
                  style={({ pressed }) => [
                    rowStyles.sourcePressable,
                    styles.layer2,
                    pressed && rowStyles.pressed60,
                  ]}
                  onPress={() => {
                    if (Platform.OS == 'ios') {
                      WebBrowser.openBrowserAsync(source.link, {
                        controlsColor: theme.colors.primary,
                        dismissButtonStyle: 'close',
                        presentationStyle:
                          WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                      }).catch((err) => {
                        Sentry.captureException(err)
                      })
                    } else {
                      router.push({
                        pathname: '/browser',
                        params: {
                          url: source.link,
                        },
                      })
                    }
                  }}
                >
                  <Text style={[styles.text_desc, styles.text_xs]}>
                    {source.name}
                  </Text>
                </FixedPressable>
              </View>
              <Text style={styles.text_meta}>·</Text>
              <View style={rowStyles.userContainer}>
                <FixedPressable
                  style={({ pressed }) => pressed && rowStyles.pressed60}
                  hitSlop={5}
                  onPress={() => {
                    router.push({
                      pathname: '/member/[username]',
                      params: {
                        username: member.username,
                      },
                    })
                  }}
                >
                  <Text
                    style={[
                      styles.text_desc,
                      styles.text_xs,
                      rowStyles.font600,
                    ]}
                  >
                    {member.username}
                  </Text>
                </FixedPressable>
              </View>
            </View>
            <View>
              <Text
                style={[
                  styles.text,
                  styles.text_base,
                  titleStyle === 'emphasized' && rowStyles.font500,
                ]}
              >
                {title}
              </Text>
              <View style={rowStyles.metaRow}>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data?.updated_at}
                </Text>
              </View>
            </View>
          </View>
          <View style={rowStyles.rightContent}></View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}

const rowStyles = StyleSheet.create({
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
  pl34: {
    paddingLeft: 34,
  },
  mt2: {
    marginTop: 8,
  },
  rightContent: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  mainPressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPressableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  sourcePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  userContainer: {
    position: 'relative',
    top: 1,
    marginLeft: 4,
  },
  font500: {
    fontWeight: '500',
  },
  font600: {
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed50: {
    opacity: 0.5,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default memo(TopicRow)
