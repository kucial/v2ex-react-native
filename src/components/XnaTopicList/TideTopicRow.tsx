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

function TideTopicRow(props: XnaFeedRowProps) {
  const { data, showAvatar, isLast } = props
  const router = useRouter()
  const { styles, theme } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View style={[rowStyles.skeletonRow, !isLast && styles.border_b_light]}>
          {showAvatar ? (
            <View style={rowStyles.skeletonAvatar}>
              <Box style={rowStyles.avatarBox} />
            </View>
          ) : (
            <View style={rowStyles.pl3}></View>
          )}
          <View style={rowStyles.skeletonBody}>
            <BlockText lines={[1, 2]} style={styles.text_base}></BlockText>
            <View style={rowStyles.mt1}>
              <InlineText width={[80, 120]} style={styles.text_xs}></InlineText>
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

  const { member, title, source, url } = props.data
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label='TideTopicRow'
        style={({ pressed }) => [
          rowStyles.mainPressable,
          !isLast && styles.border_b_light,
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
            <Text
              style={[
                styles.text,
                styles.text_base,
                props.titleStyle === 'emphasized' && rowStyles.font500,
              ]}
            >
              {title}
            </Text>
            <View style={rowStyles.metaRow}>
              <FixedPressable
                hitSlop={4}
                style={({ pressed }) => [
                  rowStyles.sourcePressable,
                  styles.layer2,
                  pressed && rowStyles.pressed60,
                ]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
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
                <Text style={[styles.text_xs, styles.text_desc]}>
                  {source.name}
                </Text>
              </FixedPressable>

              <Text style={[styles.text_xs, styles.text_desc]}>
                {data?.updated_at}
              </Text>
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
  skeletonAvatar: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  avatarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  pl3: {
    paddingLeft: 12,
  },
  skeletonBody: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  mt1: {
    marginTop: 4,
  },
  rightContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 4,
    paddingRight: 8,
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
  centerContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  viewedOpacity: {
    opacity: 0.7,
  },
  font500: {
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sourcePressable: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    borderRadius: 4,
  },
  pressed50: {
    opacity: 0.5,
  },
  pressed60: {
    opacity: 0.6,
  },
})

export default memo(TideTopicRow)
