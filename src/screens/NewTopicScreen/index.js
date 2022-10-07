import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import {
  InteractionManager,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import { addBreadcrumb, captureException } from '@sentry/react-native'
import classNames from 'classnames'
import { debounce } from 'lodash'
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import KeyboardAwareView from '@/components/KeyboardAwareView'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import Loader from '@/components/Loader'
import {
  EditorImagePicker,
  EditorProvider,
  EditorRender,
  EditorToolbar
} from '@/components/SlateEditor'
import { useAlertService } from '@/containers/AlertService'
import nodes from '@/mock/nodes'
import fetcher from '@/utils/fetcher'

import NodeSelect from './NodeSelect'

// toolbar + extra...
const VISIBLE_BOTTOM_OFFSET = 85

const pickerSnapPoints = ['90%']

const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )
}

export default function NewTopicScreen(props) {
  const { route, navigation } = props
  const { colorScheme } = useColorScheme()
  const titleInput = useRef()
  const editorRef = useRef()
  const pickerModalRef = useRef()
  const alert = useAlertService()
  const scrollViewRef = useRef()
  const scrollViewInfo = useRef({
    height: undefined,
    width: undefined,
    scrollY: 0
  })
  const editorRenderContainer = useRef()

  const tw = useTailwind()

  const [imagePickerOpened, showImagePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState({
    title: '',
    node: route.params?.node,
    content: ''
  })

  const isValid = useMemo(() => {
    return values.title && values.title.length < 120 && values.node
  }, [values])

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (titleInput.current) {
        titleInput.current.focus()
      }
    })
  }, [])

  const editorScrollIntoView = useCallback(
    debounce(() => {
      if (editorRef.current?.hasFocus() && editorRef.current.selectionBox) {
        editorRenderContainer.current.measureLayout(
          scrollViewRef.current,
          (left, top, width, height) => {
            const cursorOffsetTop = top + editorRef.current.selectionBox.top

            const visibleRegion = [
              scrollViewInfo.current.scrollY,
              scrollViewInfo.current.scrollY +
                scrollViewInfo.current.height -
                VISIBLE_BOTTOM_OFFSET
            ]

            if (
              cursorOffsetTop > visibleRegion[0] &&
              cursorOffsetTop < visibleRegion[1]
            ) {
              console.log('selection inside scrollview viewport')
              return
            }

            scrollViewRef.current.scrollTo({
              y:
                cursorOffsetTop -
                (scrollViewInfo.current.height - VISIBLE_BOTTOM_OFFSET)
            })
          }
        )
      }
    }, 100),
    []
  )

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <KeyboardAwareView animated>
        <SafeAreaView className="flex-1">
          <EditorProvider ref={editorRef}>
            <KeyboardDismiss className="flex-1">
              <ScrollView
                className="flex-1"
                ref={scrollViewRef}
                onLayout={(e) => {
                  scrollViewInfo.current.width = e.nativeEvent.layout.width
                  scrollViewInfo.current.height = e.nativeEvent.layout.height
                  editorScrollIntoView()
                }}
                onScroll={(e) => {
                  scrollViewInfo.current.scrollY = e.nativeEvent.contentOffset.y
                }}
                scrollEventThrottle={16}>
                <View className="px-4 my-3">
                  <View className="mb-1">
                    <Text className="font-medium px-2 dark:text-neutral-300">
                      标题
                    </Text>
                  </View>
                  <View>
                    <TextInput
                      className="h-[44px] px-2 bg-neutral-100 mb-2 rounded-md dark:bg-neutral-800 dark:text-neutral-300"
                      selectionColor={
                        colorScheme === 'dark'
                          ? colors.amber[50]
                          : colors.neutral[600]
                      }
                      placeholderTextColor={
                        colorScheme === 'dark'
                          ? colors.neutral[500]
                          : colors.neutral[400]
                      }
                      style={{ fontSize: 16 }}
                      placeholder="请输入主题标题"
                      onChangeText={(value) =>
                        setValues((prev) => ({
                          ...prev,
                          title: value
                        }))
                      }
                      value={values.title}
                      ref={titleInput}
                    />
                  </View>
                </View>
                <View className="px-4 my-3">
                  <View className="mb-1">
                    <Text className="font-medium px-2 dark:text-neutral-300">
                      节点
                    </Text>
                  </View>
                  <View>
                    <NodeSelect
                      options={nodes}
                      value={values.node}
                      renderLabel={(n) => (
                        <Text className="text-neutral-900 dark:text-neutral-400">
                          {n.title} / {n.name}
                        </Text>
                      )}
                      className={classNames(
                        'h-[44px] px-2 bg-neutral-100 mb-2 rounded-md flex flex-row items-center',
                        'dark:bg-neutral-800'
                      )}
                      filterPlaceholder="查询"
                      placeholder="请输入主题节点"
                      onChange={(node) => {
                        setValues((prev) => ({
                          ...prev,
                          node
                        }))
                      }}
                    />
                  </View>
                </View>
                <View className="px-4 my-3">
                  <View className="mb-1">
                    <Text className="font-medium px-2 dark:text-neutral-300">
                      正文
                    </Text>
                  </View>
                  <View>
                    <View
                      className="bg-neutral-100 dark:bg-neutral-800 mb-2 rounded-md overflow-hidden px-2 py-[10px]"
                      ref={editorRenderContainer}>
                      <EditorRender
                        placeholder="如果标题能够表达完整内容，则正文可以为空"
                        onLayout={editorScrollIntoView}
                        onCursorPositionUpdate={editorScrollIntoView}
                        containerStyle={{
                          overflow: 'hidden',
                          minHeight: 200
                        }}
                      />
                    </View>
                  </View>
                </View>
                <View className="px-4 my-3">
                  <Pressable
                    className={classNames(
                      'h-[50px] rounded-lg items-center justify-center active:opacity-60',
                      isValid
                        ? 'bg-neutral-900 dark:bg-amber-50'
                        : 'bg-neutral-900/60 dark:bg-amber-50/70'
                    )}
                    disabled={!isValid || isSubmitting}
                    onPress={async () => {
                      try {
                        setIsSubmitting(true)
                        const content = await editorRef.current.getMarkdown()
                        const payload = {
                          title: values.title,
                          syntax: 'markdown',
                          content
                        }
                        const created = await fetcher(`/page/write.json`, {
                          params: {
                            node: values.node.name
                          },
                          data: payload
                        })
                        setIsSubmitting(false)
                        navigation.replace('topic', {
                          id: created.id
                        })
                      } catch (err) {
                        setIsSubmitting(false)
                        alert.alertWithType('error', '错误', err.message)
                        if (err.data) {
                          addBreadcrumb({
                            type: 'info',
                            data: err.data
                          })
                        }
                        captureException(err)
                      }
                    }}>
                    {isSubmitting ? (
                      <Loader
                        size={20}
                        color={
                          colorScheme === 'dark'
                            ? colors.neutral[900]
                            : colors.neutral[100]
                        }
                      />
                    ) : (
                      <Text className="text-base text-white dark:text-neutral-900">
                        发布
                      </Text>
                    )}
                  </Pressable>
                </View>

                <View className="h-[56px]"></View>
              </ScrollView>
            </KeyboardDismiss>
            <View
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <EditorToolbar
                showOnFocus
                onOpenImageSelect={() => {
                  showImagePicker(true)
                  editorRef.current?.blur()
                  pickerModalRef.current.present()
                }}
              />
            </View>
            <BottomSheetModal
              ref={pickerModalRef}
              index={0}
              snapPoints={pickerSnapPoints}
              backdropComponent={renderBackdrop}
              backgroundStyle={tw('bg-white dark:bg-neutral-800')}
              handleIndicatorStyle={tw('bg-neutral-300 dark:bg-neutral-400')}
              onDismiss={() => {
                showImagePicker(false)
                editorRef.current?.focus()
              }}>
              {imagePickerOpened && (
                <EditorImagePicker
                  editor={editorRef.current}
                  onConfigSettings={() => {
                    pickerModalRef.current?.dismiss()
                    navigation.push('imgur-settings', {
                      autoBack: true
                    })
                  }}
                  onSubmit={() => {
                    pickerModalRef.current?.dismiss()
                  }}
                />
              )}
            </BottomSheetModal>
          </EditorProvider>
        </SafeAreaView>
      </KeyboardAwareView>
    </View>
  )
}
