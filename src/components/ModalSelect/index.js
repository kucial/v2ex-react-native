import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import SlideUp from '../SlideUp'

export default function ModalSelect(props) {
  const [open, setOpen] = useState(false)
  const { value, options } = props
  const { height } = useWindowDimensions()
  return (
    <>
      <Pressable
        className="active:opacity-50"
        style={props.style}
        onPress={() => {
          setOpen(true)
        }}>
        {value ? (
          props.renderLabel(value)
        ) : (
          <Text className="text-gray-400 text-[16px]">{props.placeholder}</Text>
        )}
      </Pressable>
      {open && (
        <SlideUp
          visible
          onRequestClose={() => {
            setOpen(false)
          }}>
          <View
            style={{
              height: height - 140
            }}>
            <Text>TODO</Text>
          </View>
        </SlideUp>
      )}
    </>
  )
}
