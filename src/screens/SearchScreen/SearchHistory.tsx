import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { useSearchHistory } from './hooks'

export default function SearchHistory(props) {
  const searchHistory = useSearchHistory()
  const { styles } = useTheme()
  if (searchHistory.records.length) {
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
              onPress={searchHistory.clear}
            >
              <Text style={[styles.text_primary, styles.text_base]}>清空</Text>
            </Pressable>
          </View>
        </View>
        <View>
          {searchHistory.records.map((item) => (
            <Pressable
              style={({ pressed }) => [
                searchHistoryStyles.itemPressable,
                pressed && searchHistoryStyles.pressed,
              ]}
              key={item.q}
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

  return null
}

const searchHistoryStyles = StyleSheet.create({
  container: {
    paddingTop: 16,
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
