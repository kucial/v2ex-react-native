import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Image } from 'expo-image'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const Overlay = Platform.select({
  ios: FullWindowOverlay as any,
  default: Modal,
})

export type ViewerImage = {
  uri: string
  width?: number
  height?: number
}

export type ImageViewingProps = {
  images: ViewerImage[]
  imageIndex: number
  visible: boolean
  onRequestClose: () => void
  onImageIndexChange?: (index: number) => void
  onZoomChange?: (isZoomed: boolean) => void
  backgroundColor?: string
  swipeToCloseEnabled?: boolean
  doubleTapToZoomEnabled?: boolean
  maxScale?: number
  HeaderComponent?: React.ComponentType<{
    imageIndex: number
    imagesCount: number
  }>
  FooterComponent?: React.ComponentType<{
    imageIndex: number
    imagesCount: number
  }>
}

type ZoomableImageItemProps = {
  image: ViewerImage
  backgroundColor: string
  swipeToCloseEnabled: boolean
  doubleTapToZoomEnabled: boolean
  maxScale: number
  onRequestClose: () => void
  onZoomChange?: (zoomed: boolean) => void
  isActive: boolean
  shouldCloseSV: Animated.SharedValue<boolean>
  scrollEnabledSV: Animated.SharedValue<boolean>
  zoomChangeSV: Animated.SharedValue<boolean | null>
}

function clamp(value: number, min: number, max: number) {
  'worklet'
  return Math.min(Math.max(value, min), max)
}

function getContainedSize(
  containerWidth: number,
  containerHeight: number,
  imageWidth?: number,
  imageHeight?: number,
) {
  if (!imageWidth || !imageHeight) {
    return { width: containerWidth, height: containerHeight }
  }
  const imageAspect = imageWidth / imageHeight
  const containerAspect = containerWidth / containerHeight
  if (imageAspect > containerAspect) {
    const width = containerWidth
    const height = width / imageAspect
    return { width, height }
  }
  const height = containerHeight
  const width = height * imageAspect
  return { width, height }
}

function getPanBounds(
  renderedWidth: number,
  renderedHeight: number,
  scale: number,
) {
  'worklet'
  const scaledWidth = renderedWidth * scale
  const scaledHeight = renderedHeight * scale
  return {
    boundX: Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2),
    boundY: Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2),
  }
}

function ZoomableImageItem({
  image,
  backgroundColor,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  maxScale,
  isActive,
  shouldCloseSV,
  scrollEnabledSV,
  zoomChangeSV,
}: ZoomableImageItemProps) {
  const renderedWidth = useSharedValue(
    getContainedSize(SCREEN_WIDTH, SCREEN_HEIGHT, image.width, image.height)
      .width,
  )
  const renderedHeight = useSharedValue(
    getContainedSize(SCREEN_WIDTH, SCREEN_HEIGHT, image.width, image.height)
      .height,
  )

  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const dismissY = useSharedValue(0)
  const backdropOpacity = useSharedValue(1)

  useEffect(() => {
    const size = getContainedSize(
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      image.width,
      image.height,
    )
    renderedWidth.value = size.width
    renderedHeight.value = size.height
  }, [image])

  useEffect(() => {
    if (!isActive) {
      scale.value = 1
      savedScale.value = 1
      translateX.value = 0
      translateY.value = 0
      dismissY.value = 0
      backdropOpacity.value = 1
    }
  }, [isActive])

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(isActive)
        .onUpdate((e) => {
          'worklet'
          const nextScale = clamp(savedScale.value * e.scale, 1, maxScale)
          scale.value = nextScale

          const { boundX, boundY } = getPanBounds(
            renderedWidth.value,
            renderedHeight.value,
            nextScale,
          )
          translateX.value = clamp(translateX.value, -boundX, boundX)
          translateY.value = clamp(translateY.value, -boundY, boundY)
        })
        .onEnd(() => {
          'worklet'
          savedScale.value = scale.value

          if (scale.value <= 1) {
            scale.value = withSpring(1)
            savedScale.value = 1
            translateX.value = withSpring(0)
            translateY.value = withSpring(0)
            scrollEnabledSV.value = true
            zoomChangeSV.value = false
            return
          }
          scrollEnabledSV.value = false
          zoomChangeSV.value = true
        }),
    [
      isActive,
      maxScale,
      scrollEnabledSV,
      zoomChangeSV,
      renderedWidth,
      renderedHeight,
      savedScale,
      scale,
      translateX,
      translateY,
    ],
  )

  const imagePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isActive)
        .minPointers(2)
        .onStart(() => {
          'worklet'
          startX.value = translateX.value
          startY.value = translateY.value
        })
        .onUpdate((e) => {
          'worklet'
          if (scale.value <= 1) return

          const { boundX, boundY } = getPanBounds(
            renderedWidth.value,
            renderedHeight.value,
            scale.value,
          )
          translateX.value = clamp(
            startX.value + e.translationX,
            -boundX,
            boundX,
          )
          translateY.value = clamp(
            startY.value + e.translationY,
            -boundY,
            boundY,
          )
        })
        .onEnd(() => {
          'worklet'
          if (scale.value <= 1) return

          const { boundX, boundY } = getPanBounds(
            renderedWidth.value,
            renderedHeight.value,
            scale.value,
          )
          translateX.value = withSpring(
            clamp(translateX.value, -boundX, boundX),
          )
          translateY.value = withSpring(
            clamp(translateY.value, -boundY, boundY),
          )
        }),
    [
      isActive,
      renderedWidth,
      renderedHeight,
      scale,
      startX,
      startY,
      translateX,
      translateY,
    ],
  )

  const dismissPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isActive && swipeToCloseEnabled)
        .minPointers(1)
        .maxPointers(1)
        .activeOffsetY([-5, 5])
        .failOffsetX([-20, 20])
        .onUpdate((e) => {
          'worklet'
          if (scale.value > 1) return

          dismissY.value = e.translationY
          backdropOpacity.value =
            1 - Math.min(Math.abs(e.translationY) / 260, 0.6)
        })
        .onEnd((e) => {
          'worklet'
          if (scale.value > 1) return

          const shouldClose =
            Math.abs(e.translationY) > 120 || Math.abs(e.velocityY) > 900

          if (shouldClose) {
            dismissY.value = withTiming(
              e.translationY >= 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
              { duration: 180 },
            )
            backdropOpacity.value = withTiming(
              0,
              { duration: 180 },
              (finished) => {
                'worklet'
                if (finished) {
                  shouldCloseSV.value = true
                }
              },
            )
          } else {
            dismissY.value = withSpring(0)
            backdropOpacity.value = withTiming(1)
          }
        }),
    [
      backdropOpacity,
      dismissY,
      isActive,
      shouldCloseSV,
      scale,
      swipeToCloseEnabled,
    ],
  )

  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(isActive && doubleTapToZoomEnabled)
        .numberOfTaps(2)
        .maxDuration(250)
        .maxDistance(8)
        .onEnd((e, success) => {
          'worklet'
          if (!success) return

          if (scale.value > 1) {
            scale.value = withSpring(1)
            savedScale.value = 1
            translateX.value = withSpring(0)
            translateY.value = withSpring(0)
            dismissY.value = withSpring(0)
            backdropOpacity.value = withTiming(1)
            scrollEnabledSV.value = true
            zoomChangeSV.value = false
            return
          }

          const targetScale = Math.min(2.5, maxScale)
          const { boundX, boundY } = getPanBounds(
            renderedWidth.value,
            renderedHeight.value,
            targetScale,
          )

          const tapOffsetX = e.x - SCREEN_WIDTH / 2
          const tapOffsetY = e.y - SCREEN_HEIGHT / 2
          const desiredX = (-tapOffsetX * (targetScale - 1)) / targetScale
          const desiredY = (-tapOffsetY * (targetScale - 1)) / targetScale

          scale.value = withSpring(targetScale)
          savedScale.value = targetScale
          translateX.value = withSpring(clamp(desiredX, -boundX, boundX))
          translateY.value = withSpring(clamp(desiredY, -boundY, boundY))
          scrollEnabledSV.value = false
          zoomChangeSV.value = true
        }),
    [
      doubleTapToZoomEnabled,
      isActive,
      maxScale,
      scrollEnabledSV,
      zoomChangeSV,
      renderedWidth,
      renderedHeight,
      savedScale,
      scale,
      translateX,
      translateY,
      dismissY,
      backdropOpacity,
    ],
  )

  const composedGesture = useMemo(
    () =>
      Gesture.Simultaneous(
        pinchGesture,
        imagePanGesture,
        dismissPanGesture,
        doubleTapGesture,
      ),
    [doubleTapGesture, dismissPanGesture, imagePanGesture, pinchGesture],
  )

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + dismissY.value },
      { scale: scale.value },
    ],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  return (
    <View style={[styles.page, { backgroundColor }]}>
      <Animated.View
        pointerEvents='none'
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor },
          overlayStyle,
        ]}
      />
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.imageWrap, imageStyle]}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            contentFit='contain'
            transition={120}
            onLoad={(event: any) => {
              const source = event?.source
              const w = source?.width ?? image.width
              const h = source?.height ?? image.height
              const size = getContainedSize(SCREEN_WIDTH, SCREEN_HEIGHT, w, h)
              renderedWidth.value = size.width
              renderedHeight.value = size.height
            }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

export function ImageViewing({
  images,
  imageIndex,
  visible,
  onRequestClose,
  onImageIndexChange,
  onZoomChange,
  backgroundColor = '#000',
  swipeToCloseEnabled = true,
  doubleTapToZoomEnabled = true,
  maxScale = 4,
  HeaderComponent,
  FooterComponent,
}: ImageViewingProps) {
  const listRef = useRef<FlatList<ViewerImage>>(null)
  const [currentIndex, setCurrentIndex] = useState(imageIndex)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  // Shared values that worklets write to — reactions bridge them to JS thread
  const shouldCloseSV = useSharedValue(false)
  const scrollEnabledSV = useSharedValue(true)
  const zoomChangeSV = useSharedValue<boolean | null>(null)
  // Dummy shared value for inactive items (avoids calling useSharedValue in renderItem)
  const dummyZoomSV = useSharedValue<boolean | null>(null)

  // Stable RN-runtime function references for scheduleOnRN
  const onRequestCloseRef = useRef(onRequestClose)
  onRequestCloseRef.current = onRequestClose

  const fireClose = useCallback(() => {
    onRequestCloseRef.current()
  }, [])

  const fireScrollEnabled = useCallback((enabled: boolean) => {
    setScrollEnabled(enabled)
  }, [])

  const stableOnZoomChange = useRef(onZoomChange)
  stableOnZoomChange.current = onZoomChange

  const fireZoomChange = useCallback((zoomed: boolean) => {
    stableOnZoomChange.current?.(zoomed)
  }, [])

  // Bridge: shouldCloseSV → onRequestClose (JS thread)
  useAnimatedReaction(
    () => shouldCloseSV.value,
    (val) => {
      if (val) {
        shouldCloseSV.value = false
        scheduleOnRN(fireClose)
      }
    },
  )

  // Bridge: scrollEnabledSV → setScrollEnabled (JS thread)
  useAnimatedReaction(
    () => scrollEnabledSV.value,
    (val, prev) => {
      if (val !== prev) {
        scheduleOnRN(fireScrollEnabled, val)
      }
    },
  )

  // Bridge: zoomChangeSV → onZoomChange (JS thread)
  useAnimatedReaction(
    () => zoomChangeSV.value,
    (val, prev) => {
      if (val !== null && val !== prev) {
        scheduleOnRN(fireZoomChange, val)
      }
    },
  )

  const onImageIndexChangeRef = useRef(onImageIndexChange)
  useEffect(() => {
    onImageIndexChangeRef.current = onImageIndexChange
  }, [onImageIndexChange])

  useEffect(() => {
    if (!visible) return
    setCurrentIndex(imageIndex)
    setScrollEnabled(true)
    scrollEnabledSV.value = true
    zoomChangeSV.value = null
    shouldCloseSV.value = false
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: imageIndex, animated: false })
    })
  }, [visible, imageIndex])

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0]
      if (typeof first?.index === 'number') {
        setCurrentIndex(first.index)
        setScrollEnabled(true)
        scrollEnabledSV.value = true
        onImageIndexChangeRef.current?.(first.index)
      }
    },
    [],
  )

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current
  const imagesCount = images.length

  if (!visible) return null

  const content = (
    <GestureHandlerRootView style={styles.modalRoot}>
      <View style={[styles.container, { backgroundColor }]}>
        {HeaderComponent ? (
          <View style={styles.header}>
            <HeaderComponent
              imageIndex={currentIndex}
              imagesCount={imagesCount}
            />
          </View>
        ) : (
          <View style={styles.defaultHeader}>
            <Text style={styles.counter}>
              {currentIndex + 1} / {imagesCount}
            </Text>
            <Pressable onPress={onRequestClose} hitSlop={12}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={imageIndex}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          renderItem={({ item, index }) => (
            <ZoomableImageItem
              image={item}
              backgroundColor={backgroundColor}
              swipeToCloseEnabled={swipeToCloseEnabled}
              doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              maxScale={maxScale}
              onRequestClose={onRequestClose}
              onZoomChange={onZoomChange}
              isActive={index === currentIndex}
              shouldCloseSV={shouldCloseSV}
              scrollEnabledSV={scrollEnabledSV}
              zoomChangeSV={
                index === currentIndex ? zoomChangeSV : dummyZoomSV
              }
            />
          )}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={2}
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEnabled={scrollEnabled}
          onScrollToIndexFailed={(info) => {
            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              })
            })
          }}
        />

        {FooterComponent && (
          <View style={styles.footer}>
            <FooterComponent
              imageIndex={currentIndex}
              imagesCount={imagesCount}
            />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  )

  return (
    <Overlay
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      {content}
    </Overlay>
  )
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  container: { flex: 1 },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  defaultHeader: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: { color: '#fff', fontSize: 16, fontWeight: '600' },
  closeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
