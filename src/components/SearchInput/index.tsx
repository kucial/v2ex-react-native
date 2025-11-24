import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pressable, Text, TextInput, View, ViewStyle } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

type SearchInputProps = {
  placeholder: string
  initialValue: string
  showSearchBtn?: boolean
  onSubmit(value: string): void
  onChangeText?(value: string): void
  onReset(): void
  style?: ViewStyle
}

type SearchModel = {
  focus(): void
  reset(shouldFocus?: boolean): void
  submit(): void
}

const SearchInput = forwardRef<SearchModel, SearchInputProps>((props, ref) => {
  const [text, setText] = useState(props.initialValue || '')
  const searchInput = useRef<TextInput>(null)
  const { theme, styles } = useTheme()

  const service = useMemo(
    () => ({
      focus() {
        searchInput.current?.focus()
      },
      reset(shouldFocus = true) {
        setText('')
        if (shouldFocus) {
          searchInput.current?.focus()
        }
        props.onReset?.()
      },
      submit() {
        props.onSubmit?.(text)
      },
      onChangeText(text) {
        setText(text)
        props.onChangeText?.(text)
      },
    }),
    [text],
  )

  useImperativeHandle(ref, () => service, [service])

  return (
    <View
      className='flex flex-row flex-1 px-2 items-center'
      style={props.style}
    >
      <View className='relative flex-1 pt-1 pb-2'>
        <View
          className='flex flex-row rounded-lg'
          style={props.style || styles.layer2}
        >
          <TextInput
            className='flex-1 px-2 min-h-[40px]'
            style={[styles.text, { fontSize: styles.text_base.fontSize }]}
            selectionColor={theme.colors.primary}
            placeholderTextColor={theme.colors.text_placeholder}
            ref={searchInput}
            placeholder={props.placeholder}
            returnKeyType='search'
            value={text}
            onChangeText={service.onChangeText}
            onSubmitEditing={service.submit}
          />
          {!!text && (
            <View className='h-full items-center justify-center'>
              <Pressable
                className='rounded-full w-[40px] h-[40px] active:bg-neutral-100 active:opacity-30 items-center justify-center'
                onPress={() => {
                  service.reset()
                }}
              >
                <XMarkIcon size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      {props.showSearchBtn && (
        <Pressable
          hitSlop={6}
          className={cn(
            'ml-2',
            'rounded-lg h-[36px] px-3 items-center justify-center',
            'active:bg-neutral-100 active:opacity-60',
          )}
          onPress={() => {
            service.submit()
          }}
        >
          <Text className='text-neutral-900 font-medium tracking-wide'>
            搜索
          </Text>
        </Pressable>
      )}
    </View>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
