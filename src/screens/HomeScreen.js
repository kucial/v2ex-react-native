import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <SafeAreaView>
        <Text>
          HomeScreen
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('post')
            }}>
            <Text>文章</Text>
          </TouchableOpacity>
        </Text>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({})
