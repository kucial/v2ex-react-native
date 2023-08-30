import { useEffect, useRef } from 'react'
import {
  InteractionManager,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native'
import { FunnelIcon } from 'react-native-heroicons/outline'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import Constants from 'expo-constants'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import MyClearButton from '@/components/MyClearButton'
import NodeLabel from '@/components/NodeLabel'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'
import { formatDate } from '@/utils/time'

import { CACHE_KEY } from '../constants'
import { SearchParams } from '../types'
import AdvancedSearchForm from './AdvancedSearchForm'
import SearchResultView from './SearchResultView'

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'search'>

const snapPoints = Platform.select({
  ios: ['54%'],
  android: ['54%', '80%'],
})

const hasAdvancedOption = (params: SearchParams) => {
  return (
    params.gte ||
    params.lte ||
    params.node ||
    params.username ||
    params.sort === 'created'
  )
}

export default function GoogleSearch({ navigation }: ScreenProps) {
  const { theme, styles } = useTheme()
  const searchInput = useRef<TextInput>()
  const advancedSearchModalRef = useRef<BottomSheetModal>()
  const [searchParams, updateSearchParams] = useCachedState<SearchParams>(
    CACHE_KEY,
    { q: '' },
    (state) => {
      if (typeof state === 'string') {
        return {
          q: state,
        }
      }
      return state
    },
  )
  useEffect(() => {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        searchInput.current?.focus()
      })
    }, 500)
  }, [])

  return (
    <KeyboardDismiss className="flex-1">
      <View className="flex-1">
        <View
          className="w-full flex-row items-start pl-1"
          style={[
            {
              minHeight:
                Platform.OS === 'android' ? 58 : 56 + Constants.statusBarHeight,
              paddingTop:
                Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
              flexShrink: 0,
            },
            styles.layer1,
            hasAdvancedOption(searchParams) && styles.border_b_light,
          ]}>
          <View
            className={classNames(
              'mr-1',
              Platform.select({
                ios: 'py-[6]',
                android: 'py-[8]',
              }),
            )}>
            <BackButton
              tintColor={theme.colors.text}
              onPress={() => {
                navigation.goBack()
              }}
            />
          </View>
          <View
            className={classNames(
              'pr-3 flex-1',
              Platform.select({
                ios: 'py-[6]',
                android: 'py-[8]',
              }),
            )}>
            {/* Base */}
            <View className="flex-row h-[44px]">
              <View className={classNames('relative flex-1')}>
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
                  <View className="absolute right-0 h-full flex flex-row items-center justify-center">
                    <MyClearButton
                      onPress={() => {
                        updateSearchParams((prev) => ({
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
              <View className="px-1 -mr-3">
                <Button
                  className="rounded-full w-[44px] h-[44px]"
                  variant="icon"
                  radius={22}
                  onPress={() => {
                    searchInput.current?.blur()
                    advancedSearchModalRef.current?.present()
                  }}>
                  <FunnelIcon size={20} color={theme.colors.text} />
                </Button>
              </View>
            </View>
            {/* Advanced */}
            {hasAdvancedOption(searchParams) && (
              <Button
                className="mt-1 -mb-1"
                onPress={() => {
                  searchInput.current?.blur()
                  advancedSearchModalRef.current?.present()
                }}>
                <View className="flex-row w-full items-center px-1 py-2">
                  {searchParams.gte && (
                    <>
                      <Text style={styles.text_desc}>起始日期：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}>
                        {formatDate(searchParams.gte * 1000)}
                      </Text>
                    </>
                  )}
                  {searchParams.lte && (
                    <>
                      <Text style={styles.text_desc}>结束日期：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}>
                        {formatDate(searchParams.lte * 1000)}
                      </Text>
                    </>
                  )}
                  {searchParams.sort === 'created' && (
                    <>
                      <Text style={styles.text_desc}>排序：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}>
                        {searchParams.order === '1' ? '时间升序' : '时间降序'}
                      </Text>
                    </>
                  )}
                  {searchParams.username && (
                    <>
                      <Text style={styles.text_desc}>用户：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}>
                        {searchParams.username}
                      </Text>
                    </>
                  )}
                  {searchParams.node && (
                    <>
                      <Text style={styles.text_desc}>节点：</Text>
                      <Text
                        style={[styles.text_desc, { paddingHorizontal: 4 }]}>
                        <NodeLabel name={searchParams.node} />
                      </Text>
                    </>
                  )}
                </View>
              </Button>
            )}
          </View>
        </View>
        <View className="flex-1 relative">
          {searchParams.q && <SearchResultView params={searchParams} />}
        </View>
        <MyBottomSheetModal
          ref={advancedSearchModalRef}
          snapPoints={snapPoints}>
          <BottomSheetScrollView style={{ height: '100%' }}>
            <AdvancedSearchForm
              initialValues={searchParams}
              onSubmit={(values) => {
                updateSearchParams(values)
                advancedSearchModalRef.current?.dismiss()
              }}
            />
          </BottomSheetScrollView>
        </MyBottomSheetModal>
      </View>
    </KeyboardDismiss>
  )
}
