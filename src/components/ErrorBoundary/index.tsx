import { Component, ErrorInfo, ReactNode } from 'react'
import FastImage from 'react-native-fast-image'
import RNRestart from 'react-native-restart'
import * as Sentry from 'sentry-expo'

import { clearImageCache } from '@/utils/image'
import storage from '@/utils/storage'

import ErrorNoticeView from './ErrorNoticeView'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, context: ErrorInfo) {
    Sentry.Native.addBreadcrumb({
      type: 'info',
      message: 'React exception context',
      data: context,
    })
    Sentry.Native.captureException(error)
  }

  handleRestart = () => {
    // restart app
    RNRestart.Restart()
  }

  handleReset = () => {
    storage.clearAll()
    FastImage.clearDiskCache()
    clearImageCache()
    RNRestart.Restart()
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorNoticeView
          onRestart={this.handleRestart}
          onReset={this.handleReset}
        />
      )
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary
