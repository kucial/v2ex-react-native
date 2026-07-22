import { ComponentType, useCallback, useMemo } from 'react'
import { Linking, Platform, Text } from 'react-native'
import {
  EnrichedMarkdownTextProps,
  MarkdownStyle,
} from 'react-native-enriched-markdown'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import { resolveMarkdownLinkTarget } from '@/lib/ai-chat/links'

import { useAIChatTheme } from './theme'

let NativeMarkdown: ComponentType<EnrichedMarkdownTextProps> | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NativeMarkdown = require('react-native-enriched-markdown')
    .EnrichedMarkdownText as ComponentType<EnrichedMarkdownTextProps>
} catch {
  NativeMarkdown = null
}

export default function MarkdownMessage({
  markdown,
  streaming,
}: {
  markdown: string
  streaming?: boolean
}) {
  const { colors } = useAIChatTheme()
  const router = useRouter()
  const markdownStyle = useMemo<MarkdownStyle>(
    () => ({
      paragraph: { color: colors.text, fontSize: 16.5, lineHeight: 24 },
      h1: { color: colors.text, fontSize: 25, lineHeight: 31 },
      h2: { color: colors.text, fontSize: 21, lineHeight: 27 },
      h3: { color: colors.text, fontSize: 18, lineHeight: 24 },
      strong: { color: colors.text, fontWeight: 'bold' },
      em: { color: colors.text, fontStyle: 'italic' },
      list: {
        color: colors.text,
        fontSize: 16.5,
        lineHeight: 24,
        bulletColor: colors.secondaryText,
        markerColor: colors.secondaryText,
      },
      code: {
        color: colors.codeText,
        backgroundColor: colors.inlineCodeBackground,
        fontFamily: 'Menlo',
      },
      codeBlock: {
        color: colors.codeText,
        backgroundColor: colors.codeBlockBackground,
        fontFamily: 'Menlo',
      },
      link: { color: colors.link },
      blockquote: {
        color: colors.blockquoteText,
        borderColor: colors.blockquoteBorder,
      },
    }),
    [colors],
  )
  const openLink = useCallback(
    (rawUrl: string) => {
      const { url, screen } = resolveMarkdownLinkTarget(rawUrl)
      if (screen) {
        switch (screen.name) {
          case 'topic':
            router.push({ pathname: screen.pathname, params: screen.params })
            return
          case 'member':
            router.push({ pathname: screen.pathname, params: screen.params })
            return
          case 'node':
            router.push({ pathname: screen.pathname, params: screen.params })
            return
        }
      }

      if (!/^https?:/i.test(url)) {
        void Linking.openURL(url).catch(() => {})
        return
      }
      if (Platform.OS === 'ios') {
        void WebBrowser.openBrowserAsync(url, {
          controlsColor: colors.accent,
          dismissButtonStyle: 'close',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        }).catch(() => {})
        return
      }
      router.push({ pathname: '/browser', params: { url } })
    },
    [colors.accent, router],
  )

  if (NativeMarkdown) {
    return (
      <NativeMarkdown
        markdown={markdown}
        markdownStyle={markdownStyle}
        streamingAnimation={Boolean(streaming)}
        onLinkPress={({ url }: { url: string }) => {
          openLink(url)
        }}
      />
    )
  }

  return (
    <Text
      selectable
      style={{ color: colors.text, fontSize: 16.5, lineHeight: 24 }}
    >
      {markdown}
    </Text>
  )
}
