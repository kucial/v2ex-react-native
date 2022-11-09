import { useEffect, useRef, useState } from 'react'
import {
  InteractionManager,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'
import { NProgress } from 'react-native-nprogress'
import WebView from 'react-native-webview'
import Constants from 'expo-constants'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import BackButton from '@/components/BackButton'
import { getJSON, setJSON } from '@/utils/storage'
import { getScreenInfo } from '@/utils/url'

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

const CACHE_KEY = '$app$/ui/search-keyword'

export default function SearchScreen({ navigation }) {
  const searchInput = useRef()
  const { colorScheme } = useColorScheme()
  const [keyword, setKeyword] = useState(getJSON(CACHE_KEY))
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
  }, [])
  useEffect(() => {
    setJSON(CACHE_KEY, keyword)
  }, [keyword])

  return (
    <View className="flex-1">
      <View
        className="bg-white w-full flex-row items-center pl-1 dark:bg-neutral-900"
        style={{
          height:
            Platform.OS === 'android' ? 58 : 48 + Constants.statusBarHeight,
          paddingTop: Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
        }}>
        <View className="mr-1">
          <BackButton
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            onPress={() => {
              navigation.goBack()
            }}
          />
        </View>
        <View className="flex flex-row flex-1 pr-3 items-center">
          <View className="relative flex-1 py-[6px]">
            <TextInput
              className="bg-neutral-100 rounded-lg flex-1 px-2 text-base dark:bg-neutral-800 dark:text-neutral-200"
              placeholderTextColor={
                colorScheme === 'dark'
                  ? colors.neutral[500]
                  : colors.neutral[400]
              }
              selectionColor={
                colorScheme === 'dark' ? colors.amber[50] : colors.neutral[600]
              }
              style={{ lineHeight: 20 }}
              defaultValue={keyword || ''}
              ref={searchInput}
              placeholder="输入关键词"
              returnKeyType="search"
              onSubmitEditing={({ nativeEvent }) => {
                setKeyword(nativeEvent.text)
              }}
            />
            {!!keyword && (
              <View className="absolute right-0 top-[6px] h-full flex flex-row items-center justify-center">
                <Pressable
                  className="rounded-full w-[40px] h-[40px] active:bg-neutral-100 active:opacity-60 items-center justify-center dark:active:bg-neutral-600"
                  onPress={() => {
                    setKeyword('')
                    setLoading(false)
                    searchInput.current?.clear()
                    searchInput.current?.focus()
                  }}>
                  <XMarkIcon
                    size={18}
                    color={
                      colorScheme === 'dark'
                        ? colors.neutral[500]
                        : colors.neutral[400]
                    }
                  />
                </Pressable>
              </View>
            )}
          </View>
          <Pressable
            hitSlop={6}
            className="rounded px-3 py-[10px] ml-2 active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600">
            <Text className="text-neutral-900 font-medium tracking-wide text-md dark:text-amber-50">
              搜索
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-1 relative">
        {!!keyword?.trim() && (
          <WebView
            injectedJavaScript={topicLinkCapture}
            source={{
              uri: `https://google.com/search?q=${encodeURIComponent(
                'site:v2ex.com/t ' + keyword,
              )}`,
            }}
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
