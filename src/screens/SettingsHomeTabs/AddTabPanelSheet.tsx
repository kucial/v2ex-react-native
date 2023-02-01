import { forwardRef, useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import useSWR from 'swr'

import { useTheme } from '@/containers/ThemeService'
import { getNodes } from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import TypeIcon from './TypeIcon'

const pickerSnapPoints = ['50%', '85%']
const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )
}

type Props = {
  extraItems?: HomeTabOption[]
  onSelect: (item: HomeTabOption) => void
}

const AddTabPanelSheet = forwardRef<BottomSheetModal, Props>((props, ref) => {
  const nodesSwr = useSWR('/api/nodes/all.json', getNodes)
  const { theme, styles } = useTheme()

  const tintColor = theme.colors.text

  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState(1)
  const filtered = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!filter) {
      return nodesSwr.data.data
    }
    return nodesSwr.data.data.filter((n) =>
      ['name', 'title', 'title_alternative'].some(
        (key) => n[key].indexOf(filter) > -1,
      ),
    )
  }, [nodesSwr.data, filter])

  const renderItem = useCallback(({ item, index }) => {
    return (
      <Pressable
        className="pl-3 active:opacity-50"
        onPress={() => {
          props.onSelect({
            type: 'node',
            value: item.name,
            label: item.title,
          })
        }}>
        <View
          className={classNames('h-[50px] flex flex-row items-center pr-3')}
          style={[
            styles.border_b,
            styles.border_light,
            index === 0 && styles.border_t,
          ]}>
          <TypeIcon size={18} color={tintColor} type="node" />
          <View className="ml-3">
            <Text style={styles.text}>{item.title}</Text>
          </View>
        </View>
      </Pressable>
    )
  }, [])

  const header = !filter && !!props.extraItems.length && (
    <>
      <View>
        <View className="px-3 py-1">
          <Text className="text-xs" style={styles.text_meta}>
            已禁用
          </Text>
        </View>
        {props.extraItems.map((item, index) => (
          <Pressable
            className="pl-3 active:opacity-50"
            key={`${item.type}-${item.value}`}
            onPress={() => {
              props.onSelect({
                type: item.type,
                value: item.value,
                label: item.label,
              })
            }}>
            <View
              className={classNames(
                'h-[50px] flex flex-row items-center  pr-3',
              )}
              style={[
                styles.border_b,
                styles.border_light,
                index === 0 && styles.border_t,
              ]}>
              <TypeIcon type={item.type} size={18} color={tintColor} />
              <View className="ml-3">
                <Text style={styles.text}>{item.label}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      <View className="mt-3">
        <View className="px-3 py-1">
          <Text className="text-xs" style={styles.text_meta}>
            节点
          </Text>
        </View>
      </View>
    </>
  )

  return (
    <BottomSheetModal
      ref={ref}
      index={index}
      snapPoints={pickerSnapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.overlay}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.bts_handle_bg,
      }}
      onDismiss={() => {
        setIndex(1)
      }}>
      <View className="flex-1 h-full w-full">
        <View className="p-3">
          <BottomSheetTextInput
            onFocus={() => {
              setIndex(0)
            }}
            style={{
              height: 36,
              paddingHorizontal: 8,
              borderRadius: 6,
              backgroundColor: theme.colors.overlay_input_bg,
              color: theme.colors.text,
            }}
            selectionColor={theme.colors.primary}
            placeholderTextColor={theme.colors.text_placeholder}
            placeholder={'查找'}
            returnKeyType="search"
            value={filter}
            onChangeText={(text) => {
              setFilter(text)
            }}
          />
        </View>
        <FlashList
          className="w-full flex-1 bg-blue-300"
          data={filtered}
          estimatedItemSize={50}
          renderItem={renderItem}
          keyExtractor={(n) => n.id}
          ListHeaderComponent={header}
        />
      </View>
    </BottomSheetModal>
  )
})

AddTabPanelSheet.displayName = 'AddTabPanelSheet'

export default AddTabPanelSheet
