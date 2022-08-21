import {
  View,
  Text,
  ScrollView,
  TextInput,
  SafeAreaView,
  InteractionManager,
  Pressable,
  Keyboard
} from 'react-native'
import React, { useRef, useState, useEffect, useMemo } from 'react'

import colors from 'tailwindcss/colors'

import {
  EditorProvider,
  EditorToolbar,
  EditorRender,
  EditorImagePicker
} from '@/components/SlateEditor'
import KeyboardDismiss from '@/components/KeyboardDismiss'
import KeyboardAwareView from '@/components/KeyboardAwareView'
import Loader from '@/components/Loader'
import fetcher from '@/utils/fetcher'

import nodes from '@/mock/nodes'
import SlideUp from '@/components/SlideUp'

import NodeSelect from './NodeSelect'

export default function NewTopicScreen(props) {
  const { route, navigation } = props
  const titleInput = useRef()
  const editorRef = useRef()

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

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareView animated>
        <SafeAreaView className="flex-1">
          <EditorProvider ref={editorRef}>
            <KeyboardDismiss className="flex-1">
              <ScrollView className="flex-1">
                <View className="px-4 my-3">
                  <View className="mb-1">
                    <Text className="font-medium px-2">标题</Text>
                  </View>
                  <View>
                    <TextInput
                      className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md"
                      style={{ fontSize: 16 }}
                      placeholder="请输入主题标题"
                      onChangeText={(value) =>
                        setValues((prev) => ({
                          ...prev,
                          title: value
                        }))
                      }
                      value={values.title}
                      selectionColor={colors.gray[600]}
                      ref={titleInput}
                    />
                  </View>
                </View>
                <View className="px-4 my-3">
                  <View className="mb-1">
                    <Text className="font-medium px-2">节点</Text>
                  </View>
                  <View>
                    <NodeSelect
                      options={nodes}
                      value={values.node}
                      renderLabel={(n) => (
                        <Text>
                          {n.title} / {n.name}
                        </Text>
                      )}
                      className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md flex flex-row items-center"
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
                    <Text className="font-medium px-2">正文</Text>
                  </View>
                  <View>
                    <View className="px-2 bg-gray-100 mb-2 rounded-md">
                      <EditorRender
                        placeholder="如果标题能够表达完整内容，则正文可以为空"
                        containerStyle={{
                          overflow: 'hidden',
                          minHeight: 200,
                          backgroundColor: colors.gray[100],
                          paddingTop: 10,
                          paddingBottom: 10,
                          caretColor: '#111'
                        }}
                      />
                    </View>
                  </View>
                </View>
                <View className="px-4 my-3">
                  <Pressable
                    className="h-[50px] bg-gray-900 rounded-lg items-center justify-center active:opacity-60"
                    style={!isValid ? { opacity: 0.5 } : null}
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
                      }
                    }}>
                    {isSubmitting ? (
                      <Loader size={20} color="#ffffffbc" />
                    ) : (
                      <Text className="text-white">发布</Text>
                    )}
                  </Pressable>
                </View>

                <View className="h-[56px]"></View>
              </ScrollView>
            </KeyboardDismiss>
            <View style={{ position: 'absolute', bottom: 0 }}>
              <EditorToolbar
                showOnFocus
                className="bg-white"
                onOpenImageSelect={() => {
                  showImagePicker(true)
                }}
              />
            </View>
            {imagePickerOpened && (
              <SlideUp
                visible={imagePickerOpened}
                onRequestClose={() => {
                  showImagePicker(false)
                }}
                fullHeight>
                <EditorImagePicker />
              </SlideUp>
            )}
          </EditorProvider>
        </SafeAreaView>
      </KeyboardAwareView>
    </View>
  )
}
