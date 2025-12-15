import React from 'react'
import { HTMLIframe, useHtmlIframeProps } from '@native-html/iframe-plugin'

export default function IframeRenderer(props) {
  const iframeProps = useHtmlIframeProps(props)
  const { source } = iframeProps
  if (source) {
    // TODO: handle youtube related source.
    // extarct
  }
  return React.createElement(HTMLIframe, iframeProps)
}
