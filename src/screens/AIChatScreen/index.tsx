import { useCallback, useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import { useAIChatTheme } from '@/components/AIChat/theme'
import TokenInputSheet, {
  TokenInputSheetHandle,
} from '@/components/AIChat/TokenInputSheet'

import { AIChatProvider, useAIChat } from '@/containers/AIChatService'

import ChatView from './ChatView'
import RecentsView from './RecentsView'
import { useSwipeMenu } from './swipe-menu'

const MENU_WIDTH_RATIO = 0.78
const MAX_MENU_WIDTH = 400
const EDGE_GESTURE_WIDTH = 24

function AIChatSwipeMenu() {
  const { width } = useWindowDimensions()
  const menuWidth = Math.min(width * MENU_WIDTH_RATIO, MAX_MENU_WIDTH)
  const {
    closeGesture,
    isMenuOpen,
    menuAnimatedStyle,
    setMenuOpen,
    surfaceAnimatedStyle,
    openGesture,
  } = useSwipeMenu(menuWidth)
  const {
    hydrated,
    personalTokenSource,
    personalTokenPreview,
    savePersonalToken,
    clearPersonalToken,
  } = useAIChat()
  const { colors } = useAIChatTheme()
  const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen])
  const openMenu = useCallback(() => {
    Keyboard.dismiss()
    setMenuOpen(true)
  }, [setMenuOpen])

  useEffect(() => {
    if (Platform.OS !== 'android' || !isMenuOpen) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeMenu()
      return true
    })
    return () => subscription.remove()
  }, [closeMenu, isMenuOpen])

  // One sheet for both pages: the recents list owns the settings entry, and the
  // chat view raises the same sheet when a send is blocked on the token.
  const tokenSheet = useRef<TokenInputSheetHandle>(null)
  const manageToken = useCallback((reason?: string) => {
    Keyboard.dismiss()
    tokenSheet.current?.present(reason)
  }, [])

  if (!hydrated) {
    return (
      <View
        style={[screenStyles.loading, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.secondaryText} />
      </View>
    )
  }

  return (
    <>
      <View
        style={[
          screenStyles.root,
          { backgroundColor: colors.recentsBackground },
        ]}
      >
        <Animated.View
          accessibilityElementsHidden={!isMenuOpen}
          importantForAccessibility={
            isMenuOpen ? 'auto' : 'no-hide-descendants'
          }
          pointerEvents={isMenuOpen ? 'auto' : 'none'}
          style={[screenStyles.menu, { width: menuWidth }, menuAnimatedStyle]}
        >
          <RecentsView
            menuWidth={menuWidth}
            onCloseMenu={closeMenu}
            onManageToken={manageToken}
          />
        </Animated.View>

        <GestureDetector gesture={closeGesture}>
          <Animated.View
            accessibilityElementsHidden={isMenuOpen}
            importantForAccessibility={
              isMenuOpen ? 'no-hide-descendants' : 'auto'
            }
            style={[
              screenStyles.surface,
              {
                backgroundColor: colors.background,
                shadowColor: colors.shadow,
              },
              surfaceAnimatedStyle,
            ]}
          >
            <ChatView onOpenRecents={openMenu} onManageToken={manageToken} />
            {isMenuOpen ? (
              <Pressable
                accessibilityLabel='关闭最近对话'
                accessibilityRole='button'
                onPress={closeMenu}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
          </Animated.View>
        </GestureDetector>

        {!isMenuOpen ? (
          <GestureDetector gesture={openGesture}>
            <View style={screenStyles.edgeGesture} />
          </GestureDetector>
        ) : null}
      </View>
      <TokenInputSheet
        ref={tokenSheet}
        source={personalTokenSource}
        maskedToken={personalTokenPreview}
        onSave={savePersonalToken}
        onClear={clearPersonalToken}
      />
    </>
  )
}

export default function AIChatScreen() {
  return (
    <AIChatProvider>
      <AIChatSwipeMenu />
    </AIChatProvider>
  )
}

const screenStyles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  menu: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  surface: {
    flex: 1,
    zIndex: 2,
    overflow: 'hidden',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  edgeGesture: {
    position: 'absolute',
    zIndex: 3,
    top: 0,
    bottom: 0,
    left: 0,
    width: EDGE_GESTURE_WIDTH,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
