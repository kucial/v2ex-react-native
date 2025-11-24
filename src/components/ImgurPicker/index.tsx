import { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View, ViewStyle } from 'react-native'

import { useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum, ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { useCachedState } from '@/utils/hooks'

import Album from './AlbumImages'
import { PickerContext } from './context'
import Landing from './LandingView'
import SubmitButton from './SubmitButton'

const CACHE_KEY = '$app$/ui/imgur-picker-stack'

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

  const context = useMemo(() => {
    return {
      stack,
      current: stack[stack.length - 1],
      selected,
      toggleImage,
      submit: () => {
        props.onSubmit(selected)
      },
    }
  }, [stack, selected, toggleImage, props.onSubmit])

  if (!imgur.credentials) {
    return (
      <View
        className='flex flex-1 p-8 items-center justify-center w-full'
        style={props.style}
      >
        <View className='my-5'>
          <Text style={[styles.text, styles.text_base]}>
            Imgur 服务还未设置
          </Text>
        </View>
        {props.onConfigSettings && (
          <Pressable
            className={cn(
              'h-[44px] w-[200px] rounded-md flex items-center justify-center mt-4',
              'active:opacity-60',
            )}
            style={styles.btn_primary__bg}
            onPress={props.onConfigSettings}
          >
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
          album={current.params.album}
          onBackward={() => {
            setStack((prev) => prev.slice(0, -1))
          }}
        />
      )
      break
  }

  return (
    <PickerContext.Provider value={context}>
      <View className='relative flex-1 w-full' style={props.style}>
        {view}
        <SubmitButton />
      </View>
    </PickerContext.Provider>
  )
}
