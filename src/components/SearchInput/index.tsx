import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'

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
    <View style={[searchStyles.container, props.style]}>
      <View style={searchStyles.inputWrap}>
        <View style={[searchStyles.inputBox, props.style || styles.layer2]}>
          <TextInput
            style={[
              searchStyles.textInput,
              styles.text,
              { fontSize: styles.text_base.fontSize },
            ]}
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
            <View style={searchStyles.clearWrap}>
              <Pressable
                style={({ pressed }) => [
                  searchStyles.clearBtn,
                  pressed && searchStyles.pressed,
                ]}
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
          style={({ pressed }) => [
            searchStyles.submitBtn,
            pressed && searchStyles.pressed,
          ]}
          onPress={() => {
            service.submit()
          }}
        >
          <Text style={[styles.text, searchStyles.submitText]}>搜索</Text>
        </Pressable>
      )}
    </View>
  )
})

SearchInput.displayName = 'SearchInput'

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  inputWrap: {
    position: 'relative',
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    borderRadius: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 8,
    minHeight: 40,
  },
  clearWrap: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    marginLeft: 8,
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.5,
  },
})

export default SearchInput
