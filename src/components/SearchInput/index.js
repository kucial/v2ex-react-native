import { View, Text, Pressable, TextInput } from 'react-native'
import React, {
  useState,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react'
import PropTypes from 'prop-types'
import { XIcon } from 'react-native-heroicons/outline'
import classNames from 'classnames'

function SearchInput(props, ref) {
  const [text, setText] = useState(props.initialValue || '')
  const searchInput = useRef()
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
      }
    }),
    [text]
  )

  useImperativeHandle(ref, () => service, [service])

  return (
    <View
      className="flex flex-row flex-1 px-2 items-center"
      style={props.style}>
      <View className="relative flex-1 py-2">
        <TextInput
          className="bg-gray-100 rounded-lg flex-1 px-2 h-[36px] text-[16px] leading-[20px]"
          ref={searchInput}
          placeholder={props.placeholder}
          returnKeyType="search"
          value={text}
          onChangeText={(text) => {
            setText(text)
          }}
          onSubmitEditing={() => {
            service.submit()
          }}
        />
        {!!text && (
          <View className="absolute right-0 top-2 h-full flex flex-row items-center justify-center">
            <Pressable
              className="rounded-full w-[40px] h-[40px] active:bg-gray-100 active:opacity-60 items-center justify-center"
              onPress={() => {
                service.reset()
              }}>
              <XIcon size={18} color="#333" />
            </Pressable>
          </View>
        )}
      </View>
      {props.showSearchBtn && (
        <Pressable
          hitSlop={6}
          className={classNames(
            'ml-2',
            'rounded-lg h-[36px] px-3 items-center justify-center',
            'active:bg-gray-100 active:opacity-60'
          )}
          onPress={() => {
            service.submit()
          }}>
          <Text className="text-gray-900 font-medium tracking-wide text-md">
            搜索
          </Text>
        </Pressable>
      )}
    </View>
  )
}

const FSearchInput = forwardRef(SearchInput)

FSearchInput.propTypes = {
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  showSearchBtn: PropTypes.bool,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  style: PropTypes.object
}

export default FSearchInput
