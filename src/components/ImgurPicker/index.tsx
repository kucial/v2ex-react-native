import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'

import Album from './AlbumImages'
import { AlbumContext } from './context'
import Landing from './LandingView'
import SubmitButton from './SubmitButton'

const CACHE_KEY = '$app$/ui/imgur-picker-stack'
import { ImgurAlbum, ImgurImage } from '@/containers/ImgurService/types'
import { useCachedState } from '@/utils/hooks'

export type ImgurPickerProps = {
  onSubmit: (images: ImgurImage[]) => void
  onRequestClose?(): void
  onConfigSettings(): void
  maxCount?: number
  style?: ViewStyle
}

type Stack =
  | { name: 'landing'; params: { tabIndex: number } }
  | { name: 'album'; params: { album: ImgurAlbum } }

export default function ImgurPicker(props: ImgurPickerProps) {
  const { styles } = useTheme()
  const imgur = useImgurService()
  const [stack, setStack] = useCachedState<Stack[]>(CACHE_KEY, [
    { name: 'landing', params: { tabIndex: 0 } },
  ])

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
    [props.maxCount],
  )

  if (!imgur.credentials) {
    return (
      <View
        className="flex flex-1 p-8 items-center justify-center w-full"
        style={props.style}>
        <View className="my-5">
          <Text className="text-[16px]" style={styles.text}>
            Imgur 服务还未设置
          </Text>
        </View>
        {props.onConfigSettings && (
          <Pressable
            className={classNames(
              'h-[44px] w-[200px] rounded-md flex items-center justify-center mt-4',
              'active:opacity-60',
            )}
            style={styles.btn_primary__bg}
            onPress={props.onConfigSettings}>
            <Text style={styles.btn_primary__text}>前往设置</Text>
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
          tabIndex={current.params?.tabIndex || 0}
          setTabIndex={(tabIndex) => {
            setStack((prev) => {
              return [
                ...prev.slice(0, -1),
                { name: 'landing', params: { tabIndex } },
              ]
            })
          }}
          onSelectAlbum={(album) => {
            setStack((prev) => [
              ...prev,
              {
                name: 'album',
                params: {
                  album,
                },
              },
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
  }

  console.log(stack)

  return (
    <AlbumContext.Provider
      value={'params' in current ? current.params?.album : undefined}>
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
