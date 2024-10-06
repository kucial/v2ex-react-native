import { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react-native'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

import { reset, restart } from '@/utils/app-state'

import ErrorNoticeView from './ErrorNoticeView'
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, context: ErrorInfo) {
    Sentry.addBreadcrumb({
      type: 'info',
      message: 'React exception context',
      data: context,
    })
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorNoticeView onRestart={restart} onReset={reset} />
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary
