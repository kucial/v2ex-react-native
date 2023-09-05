import { useEffect, useRef, useState } from 'react'
import { InteractionManager, Platform, TextInput, View } from 'react-native'
import { NProgress } from 'react-native-nprogress'
import WebView from 'react-native-webview'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import Constants from 'expo-constants'

import BackButton from '@/components/BackButton'
import MyClearButton from '@/components/MyClearButton'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'
import { getScreenInfo } from '@/utils/url'

import { CACHE_KEY } from './constants'
import { SearchParams } from './types'

const topicLinkCapture = `(function() {
  try {
    document.body.addEventListener('click', function(e) {
      const a = e.target.closest('a');
      if (a && /^https:\\/\\/(www\\.)?v2ex\\.com/.test(a.href)) {
        e.preventDefault();
        e.stopPropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'open-app-link',
          payload: {
            link: a.href,
          }
        }))
      }
    }, {
        capture: true
    });
  } catch (err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      error: true,
      message: err.message
    }))
  }
}())`

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'search'>
export default function GoogleSearch({ navigation }: ScreenProps) {
  const { theme, styles } = useTheme()
  const searchInput = useRef<TextInput>()
  const [searchParams, updateSearchParams] = useCachedState<SearchParams>(
    CACHE_KEY,
    { q: '' },
    (state) => {
      if (typeof state === 'string') {
        return { q: state }
      }
      return state
    },
  )
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
  }, [])

  return (
    <View className="flex-1">
      <View
        className="w-full flex-row items-center pl-1"
        style={[
          {
            height:
              Platform.OS === 'android' ? 58 : 56 + Constants.statusBarHeight,
            paddingTop:
              Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
          },
          styles.layer1,
        ]}>
        <View className="mr-1">
          <BackButton
            tintColor={theme.colors.text}
            onPress={() => {
              navigation.goBack()
            }}
          />
        </View>
        <View className="flex flex-row flex-1 pr-3 items-center">
          <View
            className={classNames(
              'relative flex-1',
              Platform.select({
                ios: 'py-[6]',
                android: 'py-[8]',
              }),
            )}>
            <TextInput
              className="rounded-lg flex-1 px-2 text-base"
              style={[styles.input__bg, styles.text, { lineHeight: 20 }]}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              defaultValue={searchParams.q || ''}
              ref={searchInput}
              placeholder="输入关键词"
              returnKeyType="search"
              onSubmitEditing={({ nativeEvent }) => {
                updateSearchParams((prev) => ({
                  ...prev,
                  q: nativeEvent.text,
                }))
              }}
            />
            {!!searchParams.q && (
              <View className="absolute right-0 top-[6px] h-full flex flex-row items-center justify-center">
                <MyClearButton
                  onPress={() => {
                    updateSearchParams((prev) => ({
                      ...prev,
                      q: '',
                    }))
                    setLoading(false)
                    searchInput.current?.clear()
                    searchInput.current?.focus()
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
      <View className="flex-1 relative">
        {!!searchParams.q?.trim() && (
          <WebView
            injectedJavaScript={topicLinkCapture}
            source={{
              uri: `https://google.com/search?q=${encodeURIComponent(
                'site:v2ex.com/t ' + searchParams.q,
              )}`,
            }}
            decelerationRate="normal"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onMessage={(event) => {
              if (event.nativeEvent.data) {
                const data = JSON.parse(event.nativeEvent.data)
                if (data.type === 'open-app-link') {
                  const screen = getScreenInfo(data.payload.link)
                  if (screen) {
                    navigation.push(screen.name, screen.params)
                  }
                }
              }
            }}></WebView>
        )}
        <View className="absolute w-full top-0">
          <NProgress backgroundColor="#333" height={3} enabled={loading} />
        </View>
      </View>
    </View>
  )
}
