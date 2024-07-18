import { Platform, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from 'sentry-expo'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'

import MaxWidthWrapper from '../MaxWidthWrapper'

export default function TideTopicRow(props: XnaFeedRowProps) {
  const { data, showAvatar, isLast } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles, theme } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className={classNames('flex flex-row items-center')}
          style={!isLast && styles.border_b_light}>
          {showAvatar ? (
            <View className="px-2 py-2 self-start">
              <Box className="w-[24px] h-[24px] rounded" />
            </View>
          ) : (
            <View className="pl-3"></View>
          )}
          <View className="flex-1 pt-1 pb-2">
            <BlockText lines={[1, 2]} style={styles.text_base}></BlockText>
            <View className="mt-1">
              <InlineText width={[80, 120]} style={styles.text_xs}></InlineText>
            </View>
          </View>
          <View className="flex flex-row justify-end pl-1 pr-2">
            <Box className="rounded-full px-2">
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
        sentry-label="TideTopicRow"
        className={classNames('flex flex-row items-center active:opacity-50')}
        style={!isLast && styles.border_b_light}
        onPress={() => {
          props.onView(url)
          if (Platform.OS == 'ios') {
            WebBrowser.openBrowserAsync(url, {
              controlsColor: theme.colors.primary,
              dismissButtonStyle: 'close',
              presentationStyle:
                WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            }).catch((err) => {
              Sentry.Native.captureException(err)
            })
          } else {
            navigation.push('browser', {
              url,
            })
          }
        }}>
        {showAvatar ? (
          <View className="px-2 py-2 self-start">
            <FixedPressable
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member,
                })
              }}>
              <Image
                recyclingKey={`user-avatar:${member.username}`}
                source={{
                  uri: member.avatar_normal,
                }}
                className="w-[24px] h-[24px] rounded"
              />
            </FixedPressable>
          </View>
        ) : (
          <View className="pl-3"></View>
        )}
        <View
          className={classNames(
            'flex-1 pt-1 pb-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}>
          <Text
            className={classNames({
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}>
            {title}
          </Text>
          <View className="mt-1 flex flex-row flex-wrap items-center">
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] mr-[6px] rounded active:opacity-60"
              style={[styles.layer2]}
              onPress={() => {
                if (Platform.OS == 'ios') {
                  WebBrowser.openBrowserAsync(source.link, {
                    controlsColor: theme.colors.primary,
                    dismissButtonStyle: 'close',
                    presentationStyle:
                      WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                  }).catch((err) => {
                    Sentry.Native.captureException(err)
                  })
                } else {
                  navigation.push('browser', {
                    url: source.link,
                  })
                }
              }}>
              <Text style={styles.text_xs} style={styles.text_desc}>
                {source.name}
              </Text>
            </FixedPressable>

            <Text style={styles.text_xs} style={styles.text_meta}>
              {data?.updated_at}
            </Text>
          </View>
        </View>
        <View className="flex flex-row justify-end pl-1 pr-2"></View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}
