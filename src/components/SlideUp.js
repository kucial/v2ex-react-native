import React, { cloneElement } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native'

import AlertService from '@/containers/AlertService'

export default function SlideUp(props) {
  const { height } = useWindowDimensions()
  return (
    <Modal
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      visible={props.visible}
      onRequestClose={props.onRequestClose}>
      <AlertService>
        <Pressable
          className="u-flex-1 justify-end items-center absolute w-full h-full backdrop-opacity-10 bg-neutral-900/20 dark:bg-neutral-900/80"
          onPress={props.onRequestClose}></Pressable>

        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            className="bg-white dark:bg-neutral-800"
            style={[
              styles.modalView,
              {
                maxHeight: height - 100
              }
            ]}>
            {cloneElement(props.children, {
              onRequestClose: props.onRequestClose,
              style: [
                props.children.props.style,
                props.fullHeight && { height: '100%' }
              ]
            })}
          </View>
        </KeyboardAvoidingView>
      </AlertService>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // backdrop: {
  //   flex: 1,
  //   justifyContent: 'flex-end',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(0, 0, 0, .3)',
  //   position: 'absolute',
  //   width: '100%',
  //   height: '100%'
  // },
  safeArea: {
    width: '100%',
    marginTop: 'auto'
  },
  modalView: {
    width: '100%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden'
  }
})
