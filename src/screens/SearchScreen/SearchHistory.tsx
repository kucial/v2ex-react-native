import { Pressable, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { useSearchHistory } from './hooks'

export default function SearchHistory(props) {
  const searchHistory = useSearchHistory()
  const { styles } = useTheme()
  if (searchHistory.records.length) {
    return (
      <View className='pt-4'>
        <View className='pl-4 pr-1 py-1 flex-row justify-between items-center'>
          <View>
            <Text style={[styles.text, { fontSize: 20, fontWeight: 'bold' }]}>
              搜索历史
            </Text>
          </View>
          <View>
            <Pressable
              className='px-3 h-[24] justify-center active:opacity-50'
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
              className='pl-4 active:opacity-50'
              key={item.q}
              onPress={() => {
                props.onSelect(item)
              }}
            >
              <View
                className='pr-4 h-[44] justify-center'
                style={styles.border_b_light}
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
