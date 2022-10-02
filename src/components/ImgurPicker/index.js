import { View, Text, Pressable } from 'react-native'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useImgurService } from '@/containers/ImgurService'

import Landing from './LandingView'
import Album from './AlbumImages'
import SubmitButton from './SubmitButton'
import { AlbumContext } from './context'
import { useNavigation } from '@react-navigation/native'
import { getJSON, setJSON } from '@/utils/storage'
import classNames from 'classnames'

const CACHE_KEY = '$app$/ui/imgur-picker-stack'

export default function ImgurPicker(props) {
  const imgur = useImgurService()
  const navigation = useNavigation()
  const [stack, setStack] = useState(getJSON(CACHE_KEY, [{ name: 'landing' }]))
  useEffect(() => {
    setJSON(CACHE_KEY, stack)
  }, [stack])

  const current = useMemo(() => {
    return stack[stack.length - 1]
  }, [stack])
  const [selected, setSelected] = useState([])
  const toggleImage = useCallback(
    (image) => {
      setSelected((prev) => {
        const index = prev.findIndex((i) => i.id === image.id)
        let next
        if (index === -1) {
          next = [...prev, image]
        } else {
          next = [...prev.slice(0, index), ...prev.slice(index + 1)]
        }
        if (props.maxCount) {
          return next.slice(-1 * props.maxCount)
        }
        return next
      })
    },
    [props.maxCount]
  )

  if (!imgur.credentials) {
    return (
      <View
        className="flex flex-1 p-8 items-center justify-center w-full"
        style={props.style}>
        <View className="my-5">
          <Text className="text-[16px] dark:text-neutral-200">
            Imgur 服务还未设置
          </Text>
        </View>
        {props.onConfigSettings && (
          <Pressable
            className={classNames(
              'h-[44px] w-[200px] rounded-md flex items-center justify-center mt-4',
              'bg-neutral-900 active:opacity-60',
              'dark:bg-amber-50 dark:opacity-90 dark:active:opacity-60'
            )}
            onPress={props.onConfigSettings}>
            <Text className="text-white dark:text-neutral-900">前往设置</Text>
          </Pressable>
        )}
      </View>
    )
  }
  let view
  switch (current.name) {
    case 'landing':
      view = (
        <Landing
          selected={selected}
          onCancel={props.onRequestClose}
          onSelectAlbum={(album) => {
            setStack((prev) => [
              ...prev,
              {
                name: 'album',
                params: {
                  album
                }
              }
            ])
          }}
          onToggleSelect={toggleImage}
        />
      )
      break
    case 'album':
      view = (
        <Album
          selected={selected}
          album={current.params.album}
          onCancel={() => {
            setStack((prev) => prev.slice(0, -1))
          }}
          onToggleSelect={toggleImage}
        />
      )
      break
    default:
      view = (
        <View>
          <Text>TOHANDLE {current.name}</Text>
        </View>
      )
  }

  return (
    <AlbumContext.Provider value={current.params?.album}>
      <View className="relative flex-1 w-full" style={props.style}>
        {view}
        <SubmitButton
          disabled={!selected.length}
          onPress={() => {
            props.onSubmit(selected)
          }}
        />
      </View>
    </AlbumContext.Provider>
  )
}
