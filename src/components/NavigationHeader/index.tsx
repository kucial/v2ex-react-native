import { type ReactNode, useMemo } from 'react'
import {
  Pressable,
  PressableProps,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useRouter } from 'expo-router'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

import BackButton from '../BackButton'

interface NavigationHeaderProps {
  title?: ReactNode
  headerTitle?: ReactNode
  headerLeft?: ReactNode
  headerRight?: ReactNode | (() => ReactNode)
  headerBackTitle?: string
  headerStyle?: ViewStyle
  headerTitleStyle?: TextStyle
  titleWrappClassName?: string
  headerTintClassName?: string
  onBack?: () => void
  canGoBack?: boolean
  modal?: boolean
  shadow?: boolean
  className?: string
}

export default function NavigationHeader({
  title,
  titleWrappClassName,
  headerTitle,
  headerLeft,
  headerRight,
  headerBackTitle,
  headerStyle,
  headerTitleStyle,
  headerTintClassName = 'color-primary',
  onBack,
  canGoBack,
  modal = false,
  shadow = true,
  className = '',
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
      return <View className='p-2 w-[44px]' />
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
      return <View className='p-2 w-[44px]' />
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
      className={cn(modal ? 'pt-1' : 'pt-safe', 'flex-shrink-0', className)}
      style={styles.layer1}
    >
      <View
        className={cn('flex-row items-center justify-between h-[52]')}
        style={[headerStyle, shadow && styles.border_b]}
      >
        {renderHeaderLeft()}
        <View
          className={cn(
            'absolute items-center left-20 right-20 z-0',
            titleWrappClassName,
          )}
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
  },
) => {
  const { variant = 'primary', className, children, ...rest } = props
  return (
    <Pressable
      className={cn(
        'h-[44px] px-3 min-w-[44px] justify-center active:opacity-50',
        className,
      )}
      {...rest}
    >
      <Text
        className={cn(
          'text-body',
          variant === 'primary' && 'color-primary',
          variant === 'secondary' && 'color-label-secondary',
        )}
      >
        {children}
      </Text>
    </Pressable>
  )
}
