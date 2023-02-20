import { Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'

import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

import { DemoRowProps } from './types'

const NormalTopicRowDemo = (props: DemoRowProps) => {
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember, viewedStatus } = props
  const { styles } = useTheme()
  return (
    <View
      className={classNames('flex flex-row items-center')}
      style={[styles.layer1, styles.border_b, styles.border_light]}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FastImage
            source={{
              uri: member.avatar_normal,
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </View>
      ) : (
        <View className="pl-3"></View>
      )}
      <View
        className={classNames(
          'flex-1 py-2',
          viewedStatus === 'viewed' && 'opacity-70',
        )}>
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <View
              className="py-[2px] px-[6px] rounded active:opacity-60"
              style={styles.layer2}>
              <Text className="text-xs" style={styles.text_desc}>
                {node.title}
              </Text>
            </View>
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View className="relative top-[1px]">
            <Text className="font-[600] text-xs" style={styles.text_desc}>
              {member.username}
            </Text>
          </View>
        </View>
        <View>
          <Text
            className={classNames('text-base', {
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={styles.text}>
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs" style={styles.text_meta}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text className="text-xs px-2" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60">
                    <Text
                      className="text-xs font-[600]"
                      style={styles.text_desc}>
                      {last_reply_by}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        {!!replies && (
          <View className="rounded-full px-2" style={styles.tag__bg}>
            <Text style={styles.tag__text}>{replies}</Text>
          </View>
        )}
      </View>
      {viewedStatus === 'has_update' && (
        <TriangleCorner
          corner="top-left"
          size={10}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.9,
          }}
        />
      )}
    </View>
  )
}

export default NormalTopicRowDemo
