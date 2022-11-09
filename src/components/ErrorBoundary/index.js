import { Component } from 'react'
import RNRestart from 'react-native-restart'
import * as Sentry from 'sentry-expo'

import ErrorNoticeView from './ErrorNoticeView'
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { error: true }
  }

  componentDidCatch(error, context) {
    Sentry.Native.captureException(error, context)
  }

  handleReset = () => {
    // restart app
    // storage.clearAll()
    RNRestart.Restart()
  }

  render() {
    if (this.state.error) {
      return <ErrorNoticeView onReset={this.handleReset} />
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary
