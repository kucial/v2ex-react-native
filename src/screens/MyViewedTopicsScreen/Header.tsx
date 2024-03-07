import { ReactElement } from 'react'
import { Platform, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'

import BackButton from '@/components/BackButton'
import SearchInput from '@/components/SearchInput'
import { useTheme } from '@/containers/ThemeService'

const HEADER_HEIGHT = 48

export default function Header(props: {
  title: string
  headerRight?: ReactElement
  initialFilter: string
  onChangeFilter: (text: string) => void
  onResetFilter: () => void
  onSubmitFilter: (text: string) => void
}) {
  const { styles } = useTheme()
  const navigation = useNavigation()
  return (
    <View style={styles.layer1}>
      <View
        className="w-full flex-row items-center pl-4"
        style={[
          {
            height:
              Platform.OS === 'android'
                ? HEADER_HEIGHT
                : HEADER_HEIGHT + Constants.statusBarHeight,
            paddingTop:
              Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
          },
        ]}>
        <View
          style={{
            position: 'absolute',
            left: 6,
            top: Platform.OS === 'android' ? 4 : Constants.statusBarHeight,
            zIndex: 10,
          }}>
          <BackButton
            tintColor={styles.text.color}
            onPress={() => {
              navigation.goBack()
            }}
          />
        </View>

        <View
          style={[
            {
              position: 'absolute',
              left: 55,
              right: 55,
              height: HEADER_HEIGHT,
              bottom: 0,
              justifyContent: 'center',
            },
          ]}>
          <Text
            style={[
              styles.text,
              { textAlign: 'center', fontSize: 17, fontWeight: '500' },
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {props.title}
          </Text>
        </View>

        {props.headerRight && (
          <View
            style={{
              position: 'absolute',
              right: 6,
              top: Platform.OS === 'android' ? 4 : Constants.statusBarHeight,
              zIndex: 10,
            }}>
            {props.headerRight}
          </View>
        )}
      </View>
      <View style={{ height: 50, width: '100%', marginTop: -6 }}>
        <SearchInput
          placeholder="查询"
          initialValue={props.initialFilter}
          onReset={props.onResetFilter}
          onSubmit={props.onSubmitFilter}
          onChangeText={props.onChangeFilter}
        />
      </View>
    </View>
  )
}
