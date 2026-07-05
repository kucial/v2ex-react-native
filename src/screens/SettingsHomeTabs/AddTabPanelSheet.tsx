import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useQuery } from '@tanstack/react-query'

import CheckIcon from '@/components/CheckIcon'

import { useTheme } from '@/containers/ThemeService'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'
import { getNodes } from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import TypeIcon from './TypeIcon'

type Props = {
  selected: HomeTabOption[]
  onChange: (tabs: HomeTabOption[]) => void
}

export interface AddTabPanelSheetRef {
  present: () => void
  dismiss: () => void
}

const AddTabPanelSheet = forwardRef<AddTabPanelSheetRef, Props>(
  (props, ref) => {
    const { selected = [], onChange } = props
    const nodesQuery = useQuery({
      queryKey: ['/api/nodes/all.json'],
      queryFn: getNodes,
      staleTime: Infinity,
    })
    const { theme, styles } = useTheme()
    const sheetRef = useRef<TrueSheet>(null)

    useImperativeHandle(ref, () => ({
      present: () => {
        presentSheet(sheetRef.current)
      },
      dismiss: () => {
        dismissSheet(sheetRef.current)
      },
    }))

    const selectedMap = useMemo(() => {
      const map = {}
      selected.forEach(function (item) {
        if (!item.disabled) {
          map[`${item.type}:${item.value}`] = true
        }
      })
      return map
    }, [selected])

    const tintColor = theme.colors.text

    const [filter, setFilter] = useState('')
    const filtered = useMemo(() => {
      if (!nodesQuery.data) {
        return null
      }
      if (!filter) {
        return nodesQuery.data.data
      }
      return nodesQuery.data.data.filter((n) =>
        ['name', 'title', 'title_alternative'].some(
          (key) => n[key].indexOf(filter) > -1,
        ),
      )
    }, [nodesQuery.data, filter])

    const renderItem = useCallback(
      ({ item, index }) => {
        return (
          <Pressable
            style={({ pressed }) => [
              addTabSheetStyles.itemPressable,
              pressed && addTabSheetStyles.pressed,
            ]}
            onPress={() => {
              const relatedItemIndex = selected.findIndex(
                (t) => t.type === 'node' && t.value === item.name,
              )
              if (relatedItemIndex > -1) {
                onChange([
                  ...selected.slice(0, relatedItemIndex),
                  ...selected.slice(relatedItemIndex + 1),
                ])
              } else {
                onChange([
                  {
                    type: 'node',
                    value: item.name,
                    label: item.title,
                  },
                  ...selected,
                ])
              }
            }}
          >
            <View
              style={[
                addTabSheetStyles.itemRow,
                styles.border_b_light,
                index === 0 && styles.border_t,
              ]}
            >
              <TypeIcon size={18} color={tintColor} type='node' />
              <View style={addTabSheetStyles.titleCol}>
                <Text style={styles.text}>{item.title}</Text>
              </View>
              {selectedMap[`node:${item.name}`] && (
                <View style={addTabSheetStyles.checkWrap}>
                  <CheckIcon size={16} color={theme.colors.success} />
                </View>
              )}
            </View>
          </Pressable>
        )
      },
      [
        styles.border_b_light,
        styles.border_t,
        styles.text,
        tintColor,
        theme.colors.success,
        onChange,
        selected,
        selectedMap,
      ],
    )

    return (
      <TrueSheet
        ref={sheetRef}
        scrollable
        backgroundColor={styles.overlay.backgroundColor}
        header={
          <View style={addTabSheetStyles.headerWrap}>
            <TextInput
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
              returnKeyType='search'
              value={filter}
              onChangeText={(text) => {
                setFilter(text)
              }}
            />
          </View>
        }
      >
        <FlatList
          nestedScrollEnabled
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(n) => n.id}
        />
      </TrueSheet>
    )
  },
)

AddTabPanelSheet.displayName = 'AddTabPanelSheet'

const addTabSheetStyles = StyleSheet.create({
  itemPressable: {
    paddingLeft: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  itemRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  titleCol: {
    marginLeft: 12,
    flex: 1,
  },
  checkWrap: {
    marginRight: 8,
  },
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
})

export default AddTabPanelSheet
