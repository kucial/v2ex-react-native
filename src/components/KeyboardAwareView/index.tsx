'use strict'

import React, { ReactNode } from 'react'
import {
  Animated,
  Keyboard,
  KeyboardEvent,
  Platform,
  View,
  ViewStyle,
} from 'react-native'

type Props = {
  animated: boolean
  useNativeDriver?: boolean
  doNotForceDismissKeyboardWhenLayoutChanges?: boolean
  style?: ViewStyle
  innerViewStyle?: ViewStyle
  children: ReactNode
}

type State = {
  height: Animated.Value
}

class KeyboardAwareView extends React.Component<Props, State> {
  debug = false
  state = {
    height: new Animated.Value(0),
  }

  outerView: View | null = null
  innerView: View | null = null

  componentDidMount() {
    Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow.bind(this))
    Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this))
  }

  debugLog(...args: any[]) {
    if (this.debug) {
      console.log.apply(this, args)
    }
  }

  onKeyboardWillShow(e: KeyboardEvent) {
    const endY = e.endCoordinates.screenY
    // var startY = e.startCoordinates.screenY
    this.debugLog(e)

    requestAnimationFrame(() => {
      if (this.outerView == null) return
      this.outerView.measure((ox, oy, width, height, px, py) => {
        this.debugLog(ox, oy, px, py)
        // target scrollView height should be :
        //   remaining height OR outerView height
        // = screen height - keyboard height OR outerView height
        const remainScreenMaxHeight = endY - py
        const outerViewMaxHeight = height
        let maxHeight = remainScreenMaxHeight
        if (maxHeight > outerViewMaxHeight) {
          maxHeight = outerViewMaxHeight
        }

        Animated.timing(this.state.height, {
          toValue: maxHeight,
          duration: this.props.animated ? 200 : 0,
          useNativeDriver: this.props.useNativeDriver || false,
        }).start()

        this.debugLog(
          'InnerView height should be ...' + maxHeight,
          remainScreenMaxHeight,
          outerViewMaxHeight,
        )
      })
    })
  }
  onKeyboardWillHide(e: KeyboardEvent) {
    const endY = e.endCoordinates.screenY
    // var startY = e.startCoordinates.screenY
    this.debugLog(e)

    requestAnimationFrame(() => {
      if (this.outerView == null) return
      this.outerView.measure((ox, oy, width, height, px, py) => {
        this.debugLog(ox, oy, px, py)
        // target scrollView height should be :
        //   remaining height OR outerView height
        // = screen height - keyboard height OR outerView height
        const remainScreenMaxHeight = endY
        const outerViewMaxHeight = height
        let maxHeight = remainScreenMaxHeight
        if (maxHeight > outerViewMaxHeight) {
          maxHeight = outerViewMaxHeight
        }

        Animated.timing(this.state.height, {
          toValue: maxHeight,
          duration: this.props.animated ? 200 : 0,
          useNativeDriver: this.props.useNativeDriver || false,
        }).start()

        this.debugLog('ScrollView height should be ...' + maxHeight)
      })
    })
  }

  render() {
    return (
      <View
        ref={(ref) => {
          this.outerView = ref
        }}
        style={[{ flex: 1 }, this.props.style]}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout
          Animated.timing(this.state.height, {
            toValue: height,
            duration: 0,
            useNativeDriver: this.props.useNativeDriver || false,
          }).start()

          if (Platform.OS === 'ios') {
            if (
              this.props.doNotForceDismissKeyboardWhenLayoutChanges === false
            ) {
              Keyboard.dismiss()
            }
          }
        }}>
        <Animated.View
          style={[{ height: this.state.height }, this.props.innerViewStyle]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout
          }}>
          {this.props.children}
        </Animated.View>
      </View>
    )
  }
}

export default KeyboardAwareView
