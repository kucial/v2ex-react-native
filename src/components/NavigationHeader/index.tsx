import { type ReactNode, useMemo } from 'react'
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useRouter } from 'expo-router'

import { useTheme } from '@/containers/ThemeService'

import BackButton from '../BackButton'

interface NavigationHeaderProps {
  title?: ReactNode
  headerTitle?: ReactNode
  headerLeft?: ReactNode
  headerRight?: ReactNode | (() => ReactNode)
  headerBackTitle?: string
  headerStyle?: ViewStyle
  headerTitleStyle?: TextStyle
  titleWrapStyle?: StyleProp<ViewStyle>
  onBack?: () => void
  canGoBack?: boolean
  modal?: boolean
  shadow?: boolean
  style?: StyleProp<ViewStyle>
}

export default function NavigationHeader({
  title,
  titleWrapStyle,
  headerTitle,
  headerLeft,
  headerRight,
  headerBackTitle,
  headerStyle,
  headerTitleStyle,
  onBack,
  canGoBack,
  modal = false,
  shadow = true,
  style,
}: NavigationHeaderProps) {
  const router = useRouter()
  const { styles } = useTheme()

  const route = useRoute()
  console.log(route)
  const displayTitle = headerTitle || title || ''

  const handleBack = useMemo(() => {
    if (onBack) {
      return onBack
    }
    if (canGoBack) {
      return () => {
        router.back()
      }
    }
    return null
  }, [onBack, canGoBack, router])

  const renderHeaderLeft = () => {
    if (headerLeft === null) {
      return <View style={navHeaderStyles.placeholder44} />
    }
    if (headerLeft) {
      return headerLeft
    }

    if (handleBack) {
      // Default back button
      return <BackButton onPress={handleBack} />
    }
    return null
  }

  const renderHeaderRight = () => {
    if (headerRight === null) {
      return <View style={navHeaderStyles.placeholder44} />
    }
    if (headerRight instanceof Function) {
      return headerRight()
    }
    if (headerRight) {
      return headerRight
    }

    // Default save button
    return null
  }

  return (
    <View
      style={[
        modal ? navHeaderStyles.ptModal : navHeaderStyles.ptSafe,
        navHeaderStyles.flexShrink,
        styles.layer1,
        style,
      ]}
    >
      <View
        style={[navHeaderStyles.row52, headerStyle, shadow && styles.border_b]}
      >
        {renderHeaderLeft()}
        <View
          style={[navHeaderStyles.titleWrap, titleWrapStyle]}
          pointerEvents='none'
        >
          <Text
            style={[styles.text_base, styles.text, headerTitleStyle]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {displayTitle}
          </Text>
        </View>
        {renderHeaderRight()}
      </View>
    </View>
  )
}

export const HeaderAction = (
  props: Omit<PressableProps, 'children'> & {
    variant?: 'primary' | 'secondary'
    children: ReactNode
    style?: StyleProp<ViewStyle>
  },
) => {
  const { variant = 'primary', style, children, ...rest } = props
  const { theme, styles } = useTheme()
  return (
    <Pressable
      style={({ pressed }) => [
        navHeaderStyles.actionBtn,
        style,
        pressed && navHeaderStyles.pressed,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.text_base,
          {
            color:
              variant === 'primary'
                ? theme.colors.primary
                : theme.colors.text_desc,
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

const navHeaderStyles = StyleSheet.create({
  placeholder44: {
    padding: 8,
    width: 44,
  },
  ptModal: {
    paddingTop: 4,
  },
  ptSafe: {
    paddingTop: 44,
  },
  flexShrink: {
    flexShrink: 0,
  },
  row52: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
  },
  titleWrap: {
    position: 'absolute',
    alignItems: 'center',
    left: 80,
    right: 80,
    zIndex: 0,
    bottom: 1,
  },
  actionBtn: {
    height: 44,
    paddingHorizontal: 12,
    minWidth: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
})
