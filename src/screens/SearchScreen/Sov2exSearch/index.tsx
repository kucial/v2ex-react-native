import { useEffect, useRef, useState } from 'react'
import {
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { FunnelIcon } from 'react-native-heroicons/outline'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import MyClearButton from '@/components/MyClearButton'
import NodeLabel from '@/components/NodeLabel'

import { useTheme } from '@/containers/ThemeService'
import { formatDate } from '@/utils/time'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'

import { useSearchHistory } from '../hooks'
import SearchHistory from '../SearchHistory'
import { SearchParams } from '../types'
import AdvancedSearchForm from './AdvancedSearchForm'
import SearchResultView from './SearchResultView'

const hasAdvancedOption = (params: SearchParams) => {
  return (
    params.gte ||
    params.lte ||
    params.node ||
    params.username ||
    params.sort === 'created'
  )
}

export default function Sov2exSearch() {
  const { theme, styles } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const searchInput = useRef<TextInput>(null)
  const advancedSearchModalRef = useRef<TrueSheet>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({ q: '' })
  const searchHistory = useSearchHistory()
  useEffect(() => {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
  }, [])

  useEffect(() => {
    if (searchParams.q) {
      searchHistory.addRecord(searchParams)
    }
  }, [searchParams, searchHistory])

  return (
    <KeyboardDismiss style={sov2exStyles.container}>
      <View style={sov2exStyles.container}>
        <View
          style={[
            sov2exStyles.headerRow,
            {
              minHeight: 56 + insets.top,
              paddingTop: insets.top,
              flexShrink: 0,
            },
            styles.layer1,
            hasAdvancedOption(searchParams) && styles.border_b_light,
          ]}
        >
          <View
            style={[
              sov2exStyles.backWrap,
              Platform.OS === 'ios' ? sov2exStyles.py6 : sov2exStyles.py8,
            ]}
          >
            <BackButton
              tintColor={theme.colors.text}
              onPress={() => {
                router.back()
              }}
            />
          </View>
          <View
            style={[
              sov2exStyles.mainCol,
              Platform.OS === 'ios' ? sov2exStyles.py6 : sov2exStyles.py8,
            ]}
          >
            {/* Base */}
            <View style={sov2exStyles.inputRow}>
              <View style={sov2exStyles.inputWrap}>
                <View style={[sov2exStyles.inputBg, styles.input__bg]}>
                  <TextInput
                    style={[
                      sov2exStyles.input,
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
                  {!!searchParams.q && (
                    <View style={sov2exStyles.clearWrap}>
                      <MyClearButton
                        onPress={() => {
                          setSearchParams((prev) => ({
                            ...prev,
                            q: '',
                          }))
                          searchInput.current?.clear()
                          searchInput.current?.focus()
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
              <View style={sov2exStyles.filterBtnWrap}>
                <Button
                  style={sov2exStyles.filterBtn}
                  variant='icon'
                  radius={22}
                  onPress={() => {
                    searchInput.current?.blur()
                    presentSheet(advancedSearchModalRef.current)
                  }}
                >
                  <FunnelIcon size={20} color={theme.colors.text} />
                </Button>
              </View>
            </View>
            {/* Advanced */}
            {hasAdvancedOption(searchParams) && (
              <Button
                style={sov2exStyles.advBtn}
                onPress={() => {
                  searchInput.current?.blur()
                  presentSheet(advancedSearchModalRef.current)
                }}
              >
                <View style={sov2exStyles.advRow}>
                  {searchParams.gte && (
                    <>
                      <Text style={styles.text_desc}>起始日期：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}
                      >
                        {formatDate(searchParams.gte * 1000)}
                      </Text>
                    </>
                  )}
                  {searchParams.lte && (
                    <>
                      <Text style={styles.text_desc}>结束日期：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}
                      >
                        {formatDate(searchParams.lte * 1000)}
                      </Text>
                    </>
                  )}
                  {searchParams.sort === 'created' && (
                    <>
                      <Text style={styles.text_desc}>排序：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}
                      >
                        {searchParams.order === '1' ? '时间升序' : '时间降序'}
                      </Text>
                    </>
                  )}
                  {searchParams.username && (
                    <>
                      <Text style={styles.text_desc}>用户：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}
                      >
                        {searchParams.username}
                      </Text>
                    </>
                  )}
                  {searchParams.node && (
                    <>
                      <Text style={styles.text_desc}>节点：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}
                      >
                        <NodeLabel name={searchParams.node} />
                      </Text>
                    </>
                  )}
                </View>
              </Button>
            )}
          </View>
        </View>
        <View style={sov2exStyles.contentWrap}>
          {searchParams.q ? (
            <SearchResultView params={searchParams} />
          ) : (
            <SearchHistory onSelect={setSearchParams} />
          )}
        </View>
        <TrueSheet
          ref={advancedSearchModalRef}
          detents={['auto']}
          scrollable
          backgroundColor={styles.overlay.backgroundColor}
        >
          <View style={sov2exStyles.sheetContent}>
            <AdvancedSearchForm
              initialValues={searchParams}
              onSubmit={(values) => {
                setSearchParams(values)
                dismissSheet(advancedSearchModalRef.current)
              }}
            />
          </View>
        </TrueSheet>
      </View>
    </KeyboardDismiss>
  )
}

const sov2exStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  backWrap: {
    marginRight: 4,
  },
  py6: {
    paddingVertical: 6,
  },
  py8: {
    paddingVertical: 8,
  },
  mainCol: {
    paddingRight: 12,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrap: {
    position: 'relative',
    flex: 1,
  },
  inputBg: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 40,
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
  filterBtnWrap: {
    paddingHorizontal: 4,
    marginRight: -12,
  },
  filterBtn: {
    borderRadius: 22,
    width: 44,
    height: 44,
  },
  advBtn: {
    marginTop: 4,
    marginBottom: -4,
  },
  advRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  contentWrap: {
    flex: 1,
    position: 'relative',
  },
  sheetContent: {
    paddingTop: 16,
    height: 400,
  },
})
