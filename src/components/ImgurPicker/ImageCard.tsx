import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'

import CheckIcon from '@/components/CheckIcon'

import { getImageLink } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

export default function ImageCard(props) {
  const { data, selected } = props
  const { theme, styles } = useTheme()
  return (
    <Pressable className='active:opacity-50 relative' onPress={props.onPress}>
      <View className='w-full pt-[100%] overflow-hidden'>
        <View
          className='absolute inset-0 w-full'
          style={{
            backgroundColor: theme.colors.text_placeholder,
          }}
        >
          <Image
            source={
              data?.link
                ? {
                    uri: getImageLink(data, 'l'),
                  }
                : require('./assets/image-placeholder.png')
            }
            contentFit='cover'
            style={{
              justifyContent: 'center',
              flex: 1,
            }}
          />
        </View>
      </View>
      <Pressable
        className={cn(
          'absolute right-0 top-0 p-2 items-center justify-center active:opacity-60',
        )}
        onPress={(e) => {
          e.stopPropagation()
          props.onToggleSelect()
        }}
      >
        <View
          className={cn(
            'w-[18px] h-[18px] rounded-full items-center justify-center',
            selected ? 'bg-neutral-800' : 'border',
          )}
          style={selected ? styles.btn_success__bg : styles.border}
        >
          {selected && <CheckIcon size={14} color='white' />}
        </View>
      </Pressable>
      {/* <View className="flex flex-row items-center mt-[2px]">
        <View className="flex-1">

        </View>
        {data.privacy === 'hidden' && (
          <View className="px-1">
            <LockClosedIcon size={12} color="#888888" />
          </View>
        )}
      </View> */}
    </Pressable>
  )
}
