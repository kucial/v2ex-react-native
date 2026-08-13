import { ElementRef, forwardRef, RefCallback, useCallback } from 'react'
import { ScrollViewProps } from 'react-native'
import {
  KeyboardChatScrollView,
  KeyboardChatScrollViewProps,
} from 'react-native-keyboard-controller'

import { useComposerKeyboardOffset } from './Composer'

export type ChatScrollViewHandle = ElementRef<typeof KeyboardChatScrollView>

type Props = ScrollViewProps &
  KeyboardChatScrollViewProps & {
    chatScrollViewRef?: { current: ChatScrollViewHandle | null }
  }

export default forwardRef<ChatScrollViewHandle, Props>(
  function VirtualizedChatScrollView({ chatScrollViewRef, ...props }, ref) {
    const keyboardOffset = useComposerKeyboardOffset()
    const combinedRef: RefCallback<ChatScrollViewHandle> = useCallback(
      (instance) => {
        if (typeof ref === 'function') ref(instance)
        else if (ref) ref.current = instance
        if (chatScrollViewRef) chatScrollViewRef.current = instance
      },
      [chatScrollViewRef, ref],
    )

    return (
      <KeyboardChatScrollView
        {...props}
        ref={combinedRef}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior='never'
        keyboardDismissMode='interactive'
        keyboardLiftBehavior='whenAtEnd'
        offset={keyboardOffset}
      />
    )
  },
)
