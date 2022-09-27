import React from 'react'
import { View, Text, SafeAreaView, StyleSheet, Pressable } from 'react-native'
import * as Sentry from '@sentry/react-native'
import RNRestart from 'react-native-restart'
import ErrorNoticeView from './ErrorNoticeView'
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
        <ErrorNoticeView
          onReset={this.handleReset}
        />
      )
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary;