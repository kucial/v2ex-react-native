import { useEffect, useRef, useState } from 'react'
import {
  InteractionManager,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { NProgress } from 'react-native-nprogress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'
import MyClearButton from '@/components/MyClearButton'

import { useTheme } from '@/containers/ThemeService'
import { getScreenInfo } from '@/utils/url'

import { useSearchHistory } from './hooks'
import SearchHistory from './SearchHistory'
import { SearchParams } from './types'

const topicLinkCapture = `(function() {
  if (window._topic_link_capture_injected) {
    return;
  }
  try {
    let i = 0;
    document.body.addEventListener('click', function(e) {
      const a = e.target.closest('a');
      if (a && /^https?:\\/\\/(?:.+\\.)?v2ex\\.com/.test(a.href)) {
        e.preventDefault();
        e.stopPropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'open-app-link',
          i: i++,
          payload: {
            link: a.href,
          }
        }))
      }
    }, {
        capture: true
    });
    window._topic_link_capture_injected = 1;
  } catch (err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      error: true,
      message: err.message
    }))
  }
}())`

export default function GoogleSearch() {
  const { theme, styles } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const searchInput = useRef<TextInput>(null)

  const searchHistory = useSearchHistory()

  const [searchParams, setSearchParams] = useState<SearchParams>({ q: '' })
  const onceLoaded = useRef(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
  }, [])

  const keyword = searchParams.q.trim()

  useEffect(() => {
    if (searchParams.q) {
      searchHistory.addRecord(searchParams)
    }
  }, [searchParams, searchHistory])

  return (
    <View style={googleSearchStyles.container}>
      <View
        style={[
          googleSearchStyles.header,
          {
            height: Platform.OS === 'android' ? 58 : 56 + insets.top,
            paddingTop: Platform.OS === 'android' ? 0 : insets.top,
          },
          styles.layer1,
        ]}
      >
        <View style={googleSearchStyles.backWrap}>
          <BackButton
            tintColor={theme.colors.text}
            onPress={() => {
              router.back()
            }}
          />
        </View>
        <View
          style={[
            googleSearchStyles.inputContainer,
            Platform.OS === 'ios'
              ? googleSearchStyles.py6
              : googleSearchStyles.py8,
          ]}
        >
          <View
            style={[googleSearchStyles.inputBg, styles.input__bg]}
          >
            <TextInput
              style={[
                googleSearchStyles.input,
                styles.text,
                { fontSize: styles.text_base.fontSize },
              ]}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              defaultValue={searchParams.q || ''}
              ref={searchInput}
              placeholder='输入关键词'
              returnKeyType='search'
              onSubmitEditing={({ nativeEvent }) => {
                setSearchParams((prev) => ({
                  ...prev,
                  q: nativeEvent.text,
                }))
              }}
            />
            {!!keyword && (
              <View style={googleSearchStyles.clearWrap}>
                <MyClearButton
                  onPress={() => {
                    setSearchParams((prev) => ({
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
      <View style={googleSearchStyles.contentWrap}>
        {!!keyword ? (
          <WebView
            injectedJavaScript={topicLinkCapture}
            source={{
              uri: `https://google.com/search?q=${encodeURIComponent(
                'site:v2ex.com/t ' + searchParams.q,
              )}`,
            }}
            style={[
              styles.layer1,
              loading && !onceLoaded.current && { opacity: 0 },
            ]}
            decelerationRate='normal'
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false)
              onceLoaded.current = true
            }}
            onMessage={(event) => {
              console.log(event, 'onMessage')
              if (event.nativeEvent.data) {
                const data = JSON.parse(event.nativeEvent.data)
                if (data.type === 'open-app-link') {
                  const screen = getScreenInfo(data.payload.link)
                  if (screen) {
                    router.push({
                      pathname: screen.pathname,
                      params: screen.params,
                    })
                  }
                }
              }
            }}
          />
        ) : (
          <SearchHistory onSelect={setSearchParams} />
        )}
        <View style={googleSearchStyles.progressWrap}>
          <NProgress
            backgroundColor={theme.colors.primary}
            height={3}
            enabled={loading}
          />
        </View>
      </View>
    </View>
  )
}

const googleSearchStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  backWrap: {
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 12,
    alignItems: 'center',
  },
  py6: {
    paddingVertical: 6,
  },
  py8: {
    paddingVertical: 8,
  },
  inputBg: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 40,
    flex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
  },
  clearWrap: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
    position: 'relative',
  },
  progressWrap: {
    position: 'absolute',
    width: '100%',
    top: 0,
  },
})
