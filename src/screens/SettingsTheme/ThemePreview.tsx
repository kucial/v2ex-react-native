import { useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import Slider from '@react-native-community/slider'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import Button from '@/components/Button'
import GroupWapper from '@/components/GroupWrapper'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MySwitch from '@/components/MySwitch'
import SectionHeader from '@/components/SectionHeader'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import * as themes from '@/containers/ThemeService/themes'
import { cn } from '@/lib/utils'
import NormalTopicRowDemo from '@/screens/SettingsPreference/NormalTopicRowDemo'

import { html, topic } from './mock'
import Swatch from './Swatch'
import ThemeOption from './ThemeOption'

const options: {
  value: 'light' | 'dark'
  label: string
}[] = [
  {
    value: 'light',
    label: '浅色',
  },
  {
    value: 'dark',
    label: '深色',
  },
]

export default function ThemePreview(props: {
  lightTheme: string
  darkTheme: string
  fontScale: number
  setLightTheme(theme: string): void
  setDarkTheme(theme: string): void
  setFontScale(scale: number): void
  colorScheme: 'dark' | 'light'
  setColorScheme(scheme: 'dark' | 'light'): void
  pureDarkTheme: boolean
  setPureDarkTheme(val: boolean): void
}) {
  const { width } = useWindowDimensions()
  const CONTAINER_WIDTH = Math.min(width, 600)
  const { styles, theme } = useTheme()
  const sheetRef = useRef<TrueSheet>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const alert = useAlertService()
  const router = useRouter()
  const activeTheme =
    props.colorScheme === 'dark' ? props.darkTheme : props.lightTheme

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <StatusBar style={props.colorScheme === 'dark' ? 'light' : 'dark'} />
        <MaxWidthWrapper>
          <View className='flex flex-row px-3 py-3 items-center'>
            <View className='flex-1'>
              <Text
                className='font-medium'
                style={[styles.text, styles.text_base]}
              >
                外观预览
              </Text>
            </View>
            <View className='w-[200] mr-1'>
              <SegmentedControl
                values={options.map((o) => o.label)}
                selectedIndex={options.findIndex(
                  (o) => o.value === props.colorScheme,
                )}
                onChange={(event) => {
                  const value =
                    options[event.nativeEvent.selectedSegmentIndex].value
                  props.setColorScheme(value)
                }}
                appearance={props.colorScheme}
              />
            </View>
          </View>
          <View className={cn('pl-3')}>
            <View className={cn('min-h-[44px] flex flex-row items-center')}>
              <View className='flex-1'>
                <Text style={[styles.text, styles.text_base]}>
                  纯黑暗夜主题
                </Text>
              </View>
              <View className='mr-2 px-2'>
                <MySwitch
                  value={props.pureDarkTheme}
                  onValueChange={(val) => props.setPureDarkTheme(val)}
                />
              </View>
            </View>
          </View>

          <View className='flex flex-row flex-wrap px-2 pt-2'>
            {Object.values(themes).map((item) => (
              <ThemeOption
                data={item}
                styles={styles}
                key={item.name}
                colorScheme={props.colorScheme}
                active={item.name === activeTheme}
                onSelect={() => {
                  if (props.colorScheme === 'dark') {
                    props.setDarkTheme(item.name)
                  } else {
                    props.setLightTheme(item.name)
                  }
                }}
              />
            ))}
          </View>

          <View className='px-3 pt-3'>
            <View>
              <Text
                className='font-medium'
                style={[styles.text, styles.text_base]}
              >
                字体大小
              </Text>
            </View>
            <View>
              <Slider
                style={{ width: width - 24, height: 40 }}
                minimumValue={1}
                maximumValue={1.2}
                step={0.05}
                minimumTrackTintColor={theme.colors.skeleton}
                maximumTrackTintColor={theme.colors.skeleton}
                thumbTintColor={theme.colors.switch_thumb}
                tapToSeek
                value={props.fontScale}
                onValueChange={(value) =>
                  props.setFontScale(Number(value.toFixed(2)))
                }
              />
              <View className='flex flex-row justify-between items-center px-1'>
                <View>
                  <Text style={[styles.text_desc, styles.text_xs]}>小</Text>
                </View>
                <View>
                  <Text style={[styles.text_desc, styles.text_base]}>大</Text>
                </View>
              </View>
            </View>
          </View>

          <SectionHeader title='骨架图' />
          <GroupWapper className='mx-2' innerStyle={styles.layer1}>
            <View className='p-3'>
              <View className='flex flex-row mb-1'>
                <Box className='w-[24] h-[24] rounded' />
                <View className='flex-1 pl-1'>
                  <InlineText style={styles.text_xs} width={120} />
                </View>
              </View>
              <BlockText lines={4} />
            </View>
          </GroupWapper>

          <SectionHeader title='列表项' />
          <GroupWapper className='mx-2' innerStyle={styles.layer1}>
            <NormalTopicRowDemo
              data={topic}
              showAvatar
              showLastReplyMember
              isLast
            />
          </GroupWapper>
          <SectionHeader title='表单' />
          <GroupWapper className='mx-2' innerStyle={styles.overlay}>
            <View className='px-2 py-4 gap-4'>
              <Button
                size='md'
                variant='primary'
                label='Open Sheet'
                onPress={(e) => {
                  sheetRef.current?.present()
                }}
              ></Button>

              <Button
                size='md'
                variant='default'
                label='About v2ex'
                onPress={(e) => {
                  router.push({
                    pathname: '/browser',
                    params: {
                      url: 'https://v2ex.com/about',
                    },
                  })
                }}
              ></Button>
              <Button
                size='md'
                variant='secondary'
                label='Secondary'
                loading={loading}
                onPress={() => setLoading((prev) => !prev)}
              ></Button>
            </View>
            <TrueSheet
              ref={sheetRef}
              detents={[0.5, 0.75]}
              backgroundColor={styles.overlay.backgroundColor}
            >
              <View className='p-4'>
                <TextInput
                  className='h-[44px] px-2 my-2 rounded-md'
                  style={[styles.text, styles.overlay_input__bg]}
                  selectionColor={theme.colors.primary}
                  placeholderTextColor={theme.colors.text_placeholder}
                  placeholder='用户名'
                  spellCheck={false}
                  autoCorrect={false}
                  autoCapitalize='none'
                />
                <TextInput
                  className='h-[44px] px-2 my-2 rounded-md'
                  style={[styles.text, styles.overlay_input__bg]}
                  selectionColor={theme.colors.primary}
                  placeholderTextColor={theme.colors.text_placeholder}
                  placeholder='密码'
                  spellCheck={false}
                  autoCorrect={false}
                  autoCapitalize='none'
                />
                <Pressable
                  className={cn(
                    'h-[44px] rounded-md flex items-center justify-center my-4',
                    'active:opacity-60',
                  )}
                  style={styles.btn_primary__bg}
                  onPress={(e) => {
                    sheetRef.current?.dismiss()
                  }}
                >
                  <Text style={[styles.btn_primary__text, styles.text_base]}>
                    确认
                  </Text>
                </Pressable>
              </View>
            </TrueSheet>
          </GroupWapper>
          <SectionHeader title='消息提示' />
          <View className='flex flex-row gap-2 px-2'>
            <View className='flex-1'>
              <Button
                onPress={() => {
                  alert.show({
                    type: 'success',
                    message: '成功消息提示',
                  })
                }}
                size='sm'
                variant='success'
                label='success'
              ></Button>
            </View>
            <View className='flex-1'>
              <Button
                onPress={() => {
                  alert.show({
                    type: 'warn',
                    message: '注意消息提示',
                  })
                }}
                size='sm'
                variant='warning'
                label='warning'
              ></Button>
            </View>
            <View className='flex-1'>
              <Button
                onPress={() => {
                  alert.show({
                    type: 'error',
                    message: '错误消息提示',
                  })
                }}
                size='sm'
                variant='danger'
                label='error'
              ></Button>
            </View>
            <View className='flex-1'>
              <Button
                onPress={() => {
                  alert.show({
                    type: 'info',
                    message: '信息消息提示',
                  })
                }}
                size='sm'
                variant='info'
                label='info'
              ></Button>
            </View>
            <View className='flex-1'>
              <Button
                onPress={() => {
                  alert.show({
                    type: 'default',
                    loading: true,
                    message: '处理中消息提示',
                  })
                }}
                size='sm'
                variant='primary'
                label='loading'
              ></Button>
            </View>
          </View>

          <SectionHeader title='富文本' />
          <GroupWapper className='mx-2' innerStyle={[styles.layer1]}>
            <View className='px-2'>
              <HtmlRender
                key={`${props.theme}-${props.colorScheme}-${props.fontScale}`}
                contentWidth={CONTAINER_WIDTH - 32}
                source={{
                  html,
                  baseUrl: 'https://v2ex.com',
                }}
              />
            </View>
          </GroupWapper>

          <SectionHeader title='色板' />
          <GroupWapper className='mx-2' innerStyle={[styles.layer1]}>
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='primary' />
              <Swatch name='background' />
              <Swatch name='card' />
              <Swatch name='text' />
              <Swatch name='border' />
              <Swatch name='notification' />
            </View>
            <View className='flex-1' style={styles.border_b} />
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='success' />
              <Swatch name='danger' />
              <Swatch name='warning' />
              <Swatch name='info' />
            </View>
            <View className='flex-1' style={styles.border_b} />
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='text_title' />
              <Swatch name='text' />
              <Swatch name='text_desc' />
              <Swatch name='text_meta' />
              <Swatch name='text_placeholder' />
              <Swatch name='text_link' />
            </View>
            <View className='flex-1' style={styles.border_b} />
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='bg_overlay' />
              <Swatch name='bg_layer1' />
              <Swatch name='bg_layer2' />
              <Swatch name='bg_layer3' />
              <Swatch name='shadow' />
              <Swatch name='skeleton' />
              <Swatch name='bg_danger_mask' />
              <Swatch name='bg_highlight_mask' />
            </View>
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='border' />
              <Swatch name='border_light' />
            </View>
            <View className='flex-1' style={styles.border_b} />
            <View className='pt-4 pl-4 flex flex-row flex-wrap'>
              <Swatch name='badge_bg' />
              <Swatch name='badge_border' />
              <Swatch name='bts_handle_bg' />
              <Swatch name='html_pre_bg' />
              <Swatch name='icon_collected_bg' />
              <Swatch name='icon_liked_bg' />
              <Swatch name='icon_markdown_bg' />
              <Swatch name='tag_bg' />
              <Swatch name='overlay_input_bg' />
              <Swatch name='input_bg' />
            </View>
          </GroupWapper>
        </MaxWidthWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
