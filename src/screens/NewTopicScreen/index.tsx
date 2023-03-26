import { useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import {
  findNodeHandle,
  InteractionManager,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { debounce } from 'lodash'
import { mutate } from 'swr'

import Button from '@/components/Button'
import KeyboardAwareView from '@/components/KeyboardAwareView'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import {
  EditorImagePicker,
  EditorProvider,
  EditorRender,
  EditorToolbar,
} from '@/components/SlateEditor'
import { SlateEditorService } from '@/components/SlateEditor/types'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { createTopic } from '@/utils/v2ex-client'

import NodeSelect from './NodeSelect'

// toolbar + extra...
const VISIBLE_BOTTOM_OFFSET = 85

const pickerSnapPoints = ['90%']

type NewTopicScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'new-topic'
>

export default function NewTopicScreen(props: NewTopicScreenProps) {
  const { theme, styles } = useTheme()
  const { route, navigation } = props
  const titleInput = useRef<TextInput>()
  const editorRef = useRef<SlateEditorService>()
  const pickerModalRef = useRef<BottomSheetModal>()
  const alert = useAlertService()
  const scrollViewRef = useRef<ScrollView>()
  const scrollViewInfo = useRef({
    height: undefined,
    width: undefined,
    scrollY: 0,
  })
  const editorRenderContainer = useRef<View>()

  const [imagePickerOpened, showImagePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState({
    title: '',
    node: route.params?.node,
    content: '',
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
        const scrollViewRefHandle = findNodeHandle(scrollViewRef.current)
        editorRenderContainer.current.measureLayout(
          scrollViewRefHandle,
          (left, top, width, height) => {
            const cursorOffsetTop = top + editorRef.current.selectionBox.top

            const visibleRegion = [
              scrollViewInfo.current.scrollY,
              scrollViewInfo.current.scrollY +
                scrollViewInfo.current.height -
                VISIBLE_BOTTOM_OFFSET,
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
                (scrollViewInfo.current.height - VISIBLE_BOTTOM_OFFSET),
            })
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
        )
      }
    }, 100),
    [],
  )

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const content = await editorRef.current.getMarkdown()
      const { data: newTopic } = await createTopic({
        title: values.title,
        content,
        node_name: values.node.name,
        syntax: 'markdown',
      })

      mutate([`/page/t/:id/topic.json`, newTopic.id], newTopic, {
        revalidate: false,
      })
      navigation.replace('topic', {
        id: newTopic.id,
      })
      alert.alertWithType('success', '成功', '主题创建成功')
    } catch (err) {
      setIsSubmitting(false)
      alert.alertWithType('error', '错误', err.message)
    }
  }, [values, navigation])

  return (
    <View className="flex-1" style={styles.layer1}>
      <KeyboardAwareView
        animated
        style={{
          height: '100%',
        }}>
        <SafeAreaView className="flex-1">
          <EditorProvider ref={editorRef}>
            <MaxWidthWrapper>
              <KeyboardDismiss style={{ flex: 1 }}>
                <ScrollView
                  className="flex-1"
                  ref={scrollViewRef}
                  onLayout={(e) => {
                    scrollViewInfo.current.width = e.nativeEvent.layout.width
                    scrollViewInfo.current.height = e.nativeEvent.layout.height
                    editorScrollIntoView()
                  }}
                  onScroll={(e) => {
                    scrollViewInfo.current.scrollY =
                      e.nativeEvent.contentOffset.y
                  }}
                  scrollEventThrottle={16}>
                  <View className="px-4 my-3">
                    <View className="mb-1">
                      <Text className="font-medium px-2" style={styles.text}>
                        标题
                      </Text>
                    </View>
                    <View>
                      <TextInput
                        className="h-[44px] px-2 mb-2 rounded-md"
                        style={[styles.layer2, styles.text, { fontSize: 16 }]}
                        selectionColor={theme.colors.primary}
                        placeholderTextColor={theme.colors.text_placeholder}
                        placeholder="请输入主题标题"
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
                  <View className="px-4 my-3">
                    <View className="mb-1">
                      <Text className="font-medium px-2" style={styles.text}>
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
                        className={classNames(
                          'h-[44px] px-2 mb-2 rounded-md flex flex-row items-center',
                        )}
                        style={[styles.layer2]}
                        filterPlaceholder="查询"
                        placeholder="请输入主题节点"
                        onChange={(node) => {
                          setValues((prev) => ({
                            ...prev,
                            node,
                          }))
                        }}
                      />
                    </View>
                  </View>
                  <View className="px-4 my-3">
                    <View className="mb-1">
                      <Text className="font-medium px-2" style={styles.text}>
                        正文
                      </Text>
                    </View>
                    <View>
                      <View
                        className="mb-2 rounded-md overflow-hidden px-2 py-[10px]"
                        style={styles.layer2}
                        ref={editorRenderContainer}>
                        <EditorRender
                          placeholder="如果标题能够表达完整内容，则正文可以为空"
                          onLayout={editorScrollIntoView}
                          onCursorPositionUpdate={editorScrollIntoView}
                          containerStyle={{
                            overflow: 'hidden',
                            minHeight: 200,
                            backgroundColor: theme.colors.bg_layer2,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View className="px-4 my-3">
                    <Button
                      label="发布"
                      disabled={!isValid}
                      loading={isSubmitting}
                      onPress={handleSubmit}
                    />
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
            </MaxWidthWrapper>
            <MyBottomSheetModal
              ref={pickerModalRef}
              index={0}
              snapPoints={pickerSnapPoints}
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
                      autoBack: true,
                    })
                  }}
                  onSubmit={() => {
                    pickerModalRef.current?.dismiss()
                  }}
                />
              )}
            </MyBottomSheetModal>
          </EditorProvider>
        </SafeAreaView>
      </KeyboardAwareView>
    </View>
  )
}
