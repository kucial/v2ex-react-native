import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@/containers/ThemeService'
import { getNodes } from '@/utils/v2ex-client'
import { NodeDetail } from '@/utils/v2ex-client/types'

type NodeSelectProps = {
  onChange(item: NodeDetail): void
  filterPlaceholder: string
  placeholder: string
  placeholderStyle: TextStyle
  style?: StyleProp<ViewStyle>
  renderLabel(item: NodeDetail): ReactElement
  value?: string
}
function NodeSelect(props: NodeSelectProps) {
  const nodesQuery = useQuery({
    queryKey: ['/api/nodes/all.json'],
    queryFn: getNodes,
  })
  const { theme, styles } = useTheme()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const selectRef = useRef<TrueSheet>(null)

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
    ({ item }) => {
      return (
        <Pressable
          style={({ pressed }) => [
            nodeSelectStyles.itemPressable,
            pressed && nodeSelectStyles.pressed,
          ]}
          onPress={() => {
            props.onChange(item)
            selectRef.current?.dismiss()
          }}
        >
          <View
            style={[nodeSelectStyles.itemRow, styles.border_b_light]}
          >
            {props.renderLabel(item)}
          </View>
        </Pressable>
      )
    },
    [props.renderLabel, styles.border_b_light],
  )

  const selectedValue = nodesQuery.data?.data.find(
    (item) => item.name === props.value,
  )

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          props.style,
          pressed && nodeSelectStyles.pressed,
        ]}
        onPress={() => {
          setOpen(true)
          selectRef.current?.present()
        }}
      >
        {selectedValue ? (
          <Text style={styles.text_base}>
            {props.renderLabel(selectedValue)}
          </Text>
        ) : (
          <Text style={[styles.text_base, props.placeholderStyle]}>
            {props.placeholder}
          </Text>
        )}
      </Pressable>
      <TrueSheet
        ref={selectRef}
        scrollable
        backgroundColor={styles.overlay.backgroundColor}
        onDidDismiss={() => {
          setOpen(false)
        }}
        header={
          <View style={nodeSelectStyles.headerWrap}>
            <TextInput
              autoFocus={!props.value}
              style={{
                height: 36,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor: theme.colors.overlay_input_bg,
                color: theme.colors.text,
              }}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              placeholder={props.filterPlaceholder}
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
    </>
  )
}

const nodeSelectStyles = StyleSheet.create({
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
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
})

export default NodeSelect
