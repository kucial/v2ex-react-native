import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
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
import { getScreenInfo, isAppLink } from '@/utils/url'

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

  const [query, setQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({ q: '' })
  const onceLoaded = useRef(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const keyword = searchParams.q.trim()

  const commitSearch = useCallback((params: SearchParams) => {
    const next = { ...params, q: params.q.trim() }
    setQuery(next.q)
    onceLoaded.current = false
    setSearchParams(next)
  }, [])

  const openV2exLink = useCallback(
    (url: string) => {
      const screen = getScreenInfo(url)
      switch (screen?.name) {
        case 'topic':
          router.push({ pathname: '/topic/[id]', params: screen.params })
          break
        case 'member':
          router.push({ pathname: '/member/[username]', params: screen.params })
          break
        case 'node':
          router.push({ pathname: '/node/[name]', params: screen.params })
          break
        default:
          router.push({ pathname: '/browser', params: { url } })
      }
    },
    [router],
  )

  const addHistoryRecord = searchHistory.addRecord
  useEffect(() => {
    if (searchParams.q) {
      addHistoryRecord(searchParams)
    }
  }, [searchParams, addHistoryRecord])

  return (
    <View style={googleSearchStyles.container}>
      <View
        style={[
          googleSearchStyles.header,
          {
            height: 56 + insets.top,
            paddingTop: insets.top,
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
          <View style={[googleSearchStyles.inputBg, styles.input__bg]}>
            <TextInput
              style={[
                googleSearchStyles.input,
                styles.text,
                Platform.OS === 'ios'
                  ? { fontSize: styles.text_base.fontSize }
                  : styles.text_base,
              ]}
              placeholderTextColor={theme.colors.text_placeholder}
              value={query}
              onChangeText={setQuery}
              ref={searchInput}
              placeholder='输入关键词'
              accessibilityLabel='搜索关键词'
              returnKeyType='search'
              onSubmitEditing={({ nativeEvent }) => {
                commitSearch({
                  ...searchParams,
                  q: nativeEvent.text,
                })
              }}
            />
            {!!query && (
              <View style={googleSearchStyles.clearWrap}>
                <MyClearButton
                  onPress={() => {
                    setQuery('')
                    setSearchParams((prev) => ({
                      ...prev,
                      q: '',
                    }))
                    setLoading(false)
                    onceLoaded.current = false
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
            decelerationRate={0.998}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false)
              onceLoaded.current = true
            }}
            onShouldStartLoadWithRequest={({ url }) => {
              if (!isAppLink(url)) {
                return true
              }
              openV2exLink(url)
              return false
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data)
                if (data.type === 'open-app-link') {
                  openV2exLink(data.payload.link)
                }
              } catch {}
            }}
          />
        ) : (
          <SearchHistory history={searchHistory} onSelect={commitSearch} />
        )}
        {loading && !onceLoaded.current && (
          <View
            style={[googleSearchStyles.loading, styles.layer1]}
            accessibilityRole='progressbar'
            accessibilityLabel='正在搜索'
          >
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[styles.text_meta, googleSearchStyles.loadingText]}>
              正在搜索…
            </Text>
          </View>
        )}
        <View style={googleSearchStyles.progressWrap}>
          <NProgress
            backgroundColor={theme.colors.primary as string}
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
    height: 40,
    paddingHorizontal: 8,
    paddingVertical: 0,
    textAlignVertical: 'center',
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
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
})
