import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { SearchHistoryService, SearchParams } from './types'

export default function SearchHistory(props: {
  history: SearchHistoryService
  onSelect: (params: SearchParams) => void
}) {
  const { history } = props
  const { styles } = useTheme()
  if (history.records.length) {
    return (
      <View style={searchHistoryStyles.container}>
        <View style={searchHistoryStyles.headerRow}>
          <View>
            <Text style={[styles.text, { fontSize: 20, fontWeight: 'bold' }]}>
              搜索历史
            </Text>
          </View>
          <View>
            <Pressable
              style={({ pressed }) => [
                searchHistoryStyles.clearBtn,
                pressed && searchHistoryStyles.pressed,
              ]}
              hitSlop={10}
              accessibilityRole='button'
              accessibilityLabel='清空搜索历史'
              onPress={history.clear}
            >
              <Text style={[styles.text_primary, styles.text_base]}>清空</Text>
            </Pressable>
          </View>
        </View>
        <View>
          {history.records.map((item) => (
            <Pressable
              style={({ pressed }) => [
                searchHistoryStyles.itemPressable,
                pressed && searchHistoryStyles.pressed,
              ]}
              key={item.q}
              accessibilityRole='button'
              accessibilityLabel={`搜索 ${item.q}`}
              onPress={() => {
                props.onSelect(item)
              }}
            >
              <View
                style={[searchHistoryStyles.itemRow, styles.border_b_light]}
              >
                <Text style={[styles.text, styles.text_base]}>{item.q}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={searchHistoryStyles.emptyContainer}>
      <Text style={[styles.text_meta, searchHistoryStyles.emptyTitle]}>
        搜索 V2EX 主题
      </Text>
      <Text style={[styles.text_meta, searchHistoryStyles.emptyDescription]}>
        输入关键词后按搜索键开始
      </Text>
    </View>
  )
}

const searchHistoryStyles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
  },
  headerRow: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    paddingHorizontal: 12,
    height: 24,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  itemPressable: {
    paddingLeft: 16,
  },
  itemRow: {
    paddingRight: 16,
    height: 44,
    justifyContent: 'center',
  },
})
