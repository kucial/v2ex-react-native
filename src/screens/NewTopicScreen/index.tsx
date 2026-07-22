import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  InteractionManager,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller'
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
  useKeyboardState,
} from 'react-native-keyboard-controller'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { debounce } from 'lodash'

import Button from '@/components/Button'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'
import {
  EditorImagePicker,
  EditorProvider,
  EditorRender,
  EditorToolbar,
} from '@/components/SlateEditor'
import { SlateEditorService } from '@/components/SlateEditor/types'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'
import { createTopic } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'

import NodeSelect from './NodeSelect'

const TOOLBAR_HEIGHT = 56
const KEYBOARD_GAP = 12
const VISIBLE_BOTTOM_OFFSET = TOOLBAR_HEIGHT + KEYBOARD_GAP

export default function NewTopicScreen() {
  const { theme, styles } = useTheme()
  const { nodeName } = useLocalSearchParams<{ nodeName?: string }>()
  const router = useRouter()

  const titleInput = useRef<TextInput>(null)
  const editorRef = useRef<SlateEditorService>(null)
  const pickerModalRef = useRef<TrueSheet>(null)
  const alert = useAlertService()
  const scrollViewRef = useRef<KeyboardAwareScrollViewRef>(null)
  const scrollViewInfo = useRef({
    height: 0,
    width: 0,
    scrollY: 0,
  })
  const editorRenderContainer = useRef<View>(null)
  const keyboardHeight = useKeyboardState((state) =>
    state.isVisible ? state.height : 0,
  )

  const [imagePickerOpened, showImagePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState({
    title: '',
    node: typeof nodeName === 'string' ? nodeName : '',
  })

  const isValid = useMemo(() => {
    return Boolean(values.title && values.title.length < 120 && values.node)
  }, [values])

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (titleInput.current) {
        titleInput.current.focus()
      }
    })
  }, [])

  const editorScrollIntoView = useMemo(
    () =>
      debounce(() => {
        const editor = editorRef.current
        const scrollView = scrollViewRef.current
        const selectionBox = editor?.selectionBox
        if (
          editorRenderContainer.current &&
          scrollView &&
          editor?.hasFocus() &&
          selectionBox
        ) {
          // Fabric: measureLayout requires a native component ref, not a
          // findNodeHandle number
          const scrollViewNativeRef = scrollView.getNativeScrollRef?.()
          if (!scrollViewNativeRef) {
            return
          }
          editorRenderContainer.current.measureLayout(
            scrollViewNativeRef,
            (left, top, width, height) => {
              const cursorOffsetTop = top + selectionBox.top

              const visibleBottom =
                scrollViewInfo.current.scrollY +
                scrollViewInfo.current.height -
                keyboardHeight -
                VISIBLE_BOTTOM_OFFSET
              const visibleRegion = [
                scrollViewInfo.current.scrollY,
                visibleBottom,
              ]

              if (
                cursorOffsetTop > visibleRegion[0] &&
                cursorOffsetTop < visibleRegion[1]
              ) {
                console.log('selection inside scrollview viewport')
                return
              }

              scrollView.scrollTo({
                y: Math.max(
                  cursorOffsetTop -
                    (scrollViewInfo.current.height -
                      keyboardHeight -
                      VISIBLE_BOTTOM_OFFSET),
                  0,
                ),
              })
            },
            () => {},
          )
        }
      }, 100),
    [keyboardHeight],
  )

  useEffect(() => {
    return () => {
      editorScrollIntoView.cancel()
    }
  }, [editorScrollIntoView])

  const queryClient = useQueryClient()

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const editor = editorRef.current
      if (!editor?.isReady()) {
        throw new ApiError({
          code: 'EDITOR_NOT_READY',
          message: '编辑器还没有准备好',
        })
      }
      const content = await editor.getMarkdown()
      const { data: newTopic } = await createTopic({
        title: values.title,
        content,
        node_name: values.node,
        syntax: 'markdown',
        once: '000000',
      })
      queryClient.setQueryData(
        [`/page/t/:id/topic.json`, newTopic.id.toString()],
        newTopic,
      )
      router.replace({
        pathname: '/topic/[id]',
        params: {
          id: newTopic.id,
        },
      })
      alert.show({ type: 'success', message: '主题创建成功' })
    } catch (err) {
      setIsSubmitting(false)
      if (err instanceof ApiError && err.code === 'PROBLEMS') {
        alert.show({
          type: 'error',
          message:
            err.message +
            (Array.isArray(err.data)
              ? err.data.map((line: string, i: number) => `${i + 1}. ${line}`)
              : []
            ).join('; '),
        })
      } else {
        alert.show({
          type: 'error',
          message: err instanceof Error ? err.message : '发布失败',
        })
      }
    }
  }, [values, router, alert, queryClient])

  return (
    <View style={newTopicStyles.container}>
      <NavigationHeader canGoBack title='新主题' />
      <View style={[newTopicStyles.container, styles.layer1]}>
        <View style={newTopicStyles.container}>
          <EditorProvider ref={editorRef}>
            <MaxWidthWrapper>
              <KeyboardDismiss style={newTopicStyles.container}>
                <KeyboardAwareScrollView
                  ref={scrollViewRef}
                  bottomOffset={VISIBLE_BOTTOM_OFFSET}
                  disableScrollOnKeyboardHide
                  extraKeyboardSpace={TOOLBAR_HEIGHT}
                  keyboardDismissMode='interactive'
                  keyboardShouldPersistTaps='handled'
                  mode='insets'
                  scrollEventThrottle={16}
                  style={newTopicStyles.container}
                  onLayout={(e) => {
                    scrollViewInfo.current.width = e.nativeEvent.layout.width
                    scrollViewInfo.current.height = e.nativeEvent.layout.height
                    editorScrollIntoView()
                  }}
                  onScroll={(e) => {
                    scrollViewInfo.current.scrollY =
                      e.nativeEvent.contentOffset.y
                  }}
                >
                  <View style={newTopicStyles.section}>
                    <View style={newTopicStyles.labelWrap}>
                      <Text style={[newTopicStyles.labelText, styles.text]}>
                        标题
                      </Text>
                    </View>
                    <View>
                      <TextInput
                        style={[
                          newTopicStyles.input,
                          styles.layer2,
                          styles.text,
                          { fontSize: 16 },
                        ]}
                        selectionColor={theme.colors.primary}
                        placeholderTextColor={theme.colors.text_placeholder}
                        placeholder='请输入主题标题'
                        onChangeText={(value) =>
                          setValues((prev) => ({
                            ...prev,
                            title: value,
                          }))
                        }
                        value={values.title}
                        ref={titleInput}
                      />
                    </View>
                  </View>
                  <View style={newTopicStyles.section}>
                    <View style={newTopicStyles.labelWrap}>
                      <Text style={[newTopicStyles.labelText, styles.text]}>
                        节点
                      </Text>
                    </View>
                    <View>
                      <NodeSelect
                        value={values.node}
                        renderLabel={(n) => (
                          <Text style={styles.text}>
                            {n.title} / {n.name}
                          </Text>
                        )}
                        placeholderStyle={{
                          color: theme.colors.text_placeholder,
                        }}
                        style={[newTopicStyles.nodeSelectBtn, styles.layer2]}
                        filterPlaceholder='查询'
                        placeholder='请输入主题节点'
                        onChange={(node) => {
                          setValues((prev) => ({
                            ...prev,
                            node: node.name,
                          }))
                        }}
                      />
                    </View>
                  </View>
                  <View style={newTopicStyles.section}>
                    <View style={newTopicStyles.labelWrap}>
                      <Text style={[newTopicStyles.labelText, styles.text]}>
                        正文
                      </Text>
                    </View>
                    <View>
                      <View
                        style={[newTopicStyles.editorBox, styles.layer2]}
                        ref={editorRenderContainer}
                      >
                        <EditorRender
                          placeholder='如果标题能够表达完整内容，则正文可以为空'
                          onLayout={editorScrollIntoView}
                          onCursorPositionUpdate={editorScrollIntoView}
                          containerStyle={{
                            overflow: 'hidden',
                            minHeight: 200,
                            backgroundColor:
                              typeof theme.colors.bg_layer2 === 'string'
                                ? theme.colors.bg_layer2
                                : undefined,
                            '--placeholder-color':
                              typeof theme.colors.text_placeholder === 'string'
                                ? theme.colors.text_placeholder
                                : undefined,
                            color:
                              typeof theme.colors.text === 'string'
                                ? theme.colors.text
                                : undefined,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={newTopicStyles.section}>
                    <Button
                      variant='primary'
                      size='md'
                      label='发布'
                      disabled={!isValid || isSubmitting}
                      loading={isSubmitting}
                      onPress={handleSubmit}
                    />
                  </View>

                  <View style={newTopicStyles.bottomSpacer} />
                </KeyboardAwareScrollView>
              </KeyboardDismiss>
              <KeyboardStickyView
                style={newTopicStyles.toolbarSticky}
                offset={{ closed: 0, opened: 0 }}
              >
                <EditorToolbar
                  showOnFocus
                  onOpenImageSelect={() => {
                    showImagePicker(true)
                    editorRef.current?.blur()
                    presentSheet(pickerModalRef.current)
                  }}
                />
              </KeyboardStickyView>
            </MaxWidthWrapper>
            <TrueSheet
              ref={pickerModalRef}
              detents={[0.9]}
              onDidDismiss={() => {
                showImagePicker(false)
                editorRef.current?.focus()
              }}
            >
              {imagePickerOpened && (
                <EditorImagePicker
                  editor={editorRef.current}
                  onConfigSettings={() => {
                    dismissSheet(pickerModalRef.current)
                    router.push({
                      pathname: '/imgur-settings',
                      params: {
                        autoBack: '1',
                      },
                    })
                  }}
                  onSubmit={() => {
                    dismissSheet(pickerModalRef.current)
                  }}
                />
              )}
            </TrueSheet>
          </EditorProvider>
        </View>
      </View>
    </View>
  )
}

const newTopicStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  labelWrap: {
    marginBottom: 4,
  },
  labelText: {
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  input: {
    height: 44,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  nodeSelectBtn: {
    height: 44,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorBox: {
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  bottomSpacer: {
    height: TOOLBAR_HEIGHT,
  },
  toolbarSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})
