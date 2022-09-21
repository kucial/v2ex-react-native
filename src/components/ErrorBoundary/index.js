import React from 'react'
import { View, Text, SafeAreaView, StyleSheet, Pressable } from 'react-native'
import { InformationCircleIcon } from 'react-native-heroicons/outline'
import * as Sentry from '@sentry/react-native'
import RNRestart from 'react-native-restart'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  content: {
    paddingTop: 48
  }
})
class ErrorBoundary extends React.Component {
  state = {
    error: false
  }

  static getDerivedStateFromError(error) {
    return { error: true }
  }

  componentDidCatch(error, context) {
    Sentry.captureException(error, context)
  }

  handleReset = async () => {
    // restart app
    RNRestart.Restart()
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                <InformationCircleIcon
                  size={36}
                  style={{ marginRight: 8 }}
                  color='#333'
                />
                <Text style={{ fontSize: 32, color:'#333' }}>哎呦，出了点问题</Text>
              </View>
              <Text
                style={{
                  lineHeight: 23,
                  marginBottom: 32,
                  fontSize: 16,
                  color: '#333'
                }}>
                该应用程序遇到问题，无法继续。 我们道歉 对于由此造成的任何不便！
                按下下方按钮即可 重新启动应用程序。
                如果此问题仍然存在，请与我们联系。
              </Text>
              <Pressable
                style={({ pressed }) => ({
                  height: 50,
                  backgroundColor: '#121222',
                  borderRadius: 12,
                  opacity: pressed ? 0.6 : 1,
                  alignItems: 'center',
                  justifyContent: 'center'
                })}
                onPress={() => this.handleReset()}>
                <Text style={{ color: 'white'}}>重新启动APP</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      )
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary;