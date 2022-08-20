import {
  View,
  Text,
  InteractionManager,
  TextInput,
  Pressable
} from 'react-native'
import React, { useRef, useEffect, useState } from 'react'
import Constants from 'expo-constants'
import BackButton from '@/components/BackButton'
import { useTailwind } from 'tailwindcss-react-native'
import WebView from 'react-native-webview'
import { XIcon } from 'react-native-heroicons/outline'
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

export default function SearchScreen({ navigation }) {
  const searchInput = useRef()
  const tw = useTailwind()
  const [keyword, setKeyword] = useState('')
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      searchInput.current?.focus()
    })
  }, [])

  return (
    <View className="flex-1">
      <View
        className="bg-white w-full flex-row items-center pl-1"
        style={{
          height: 48 + Constants.statusBarHeight,
          paddingTop: Constants.statusBarHeight
        }}>
        <View className="mr-1">
          <BackButton
            onPress={() => {
              navigation.goBack()
            }}
          />
        </View>
        <View className="flex flex-row flex-1 pr-3 items-center">
          <View className="relative flex-1 py-2">
            <TextInput
              style={{
                ...tw('bg-gray-100 rounded-lg flex-1 px-2 text-base'),
                lineHeight: 20
              }}
              ref={searchInput}
              placeholder="输入关键词"
              returnKeyType="search"
              onSubmitEditing={({ nativeEvent }) => {
                setKeyword(nativeEvent.text)
              }}
            />
            {!!keyword && (
              <View className="absolute right-0 top-2 h-full flex flex-row items-center justify-center">
                <Pressable
                  className="rounded-full w-[40px] h-[40px] active:bg-gray-100 active:opacity-60 items-center justify-center"
                  onPress={() => {
                    setKeyword('')
                    searchInput.current?.clear()
                    searchInput.current?.focus()
                  }}>
                  <XIcon size={18} color="#333" />
                </Pressable>
              </View>
            )}
          </View>
          <Pressable
            hitSlop={6}
            className="rounded px-3 py-2 ml-2 active:bg-gray-100 active:opacity-60">
            <Text className="text-gray-900 font-medium tracking-wide text-md">
              搜索
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-1">
        {!!keyword?.trim() && (
          <WebView
            injectedJavaScript={topicLinkCapture}
            source={{
              uri: `https://google.com/search?q=${encodeURIComponent(
                'site:v2ex.com/t ' + keyword
              )}`
            }}
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
      </View>
    </View>
  )
}
