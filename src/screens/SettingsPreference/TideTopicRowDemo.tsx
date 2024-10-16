import { Text, View } from 'react-native'
import classNames from 'classnames'
import { Image } from 'expo-image'

import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

import { DemoRowProps } from './types'

const TideTopicRowDemo = (props: DemoRowProps) => {
  const { styles } = useTheme()
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember, viewedStatus } = props
  return (
    <View
      className={classNames('flex flex-row items-center')}
      style={[styles.layer1, styles.border_b_light]}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <Image
            recyclingKey={`user-avatar:${member.username}`}
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
          'flex-1 pt-1 pb-2',
          viewedStatus === 'viewed' && 'opacity-70',
        )}>
        <View>
          <Text
            className={classNames({
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}>
            {title}
          </Text>
          <View className="mt-1 flex flex-row items-center">
            <View
              className="py-[2px] px-[6px] mr-2 rounded active:opacity-60"
              style={styles.layer2}>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {node.title}
              </Text>
            </View>
            <Text style={[styles.text_meta, styles.text_xs]}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text
                  className="px-1"
                  style={[styles.text_meta, styles.text_xs]}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60">
                    <Text
                      className="font-[600]"
                      style={[styles.text_desc, styles.text_xs]}>
                      {last_reply_by}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="flex flex-row justify-end pl-1 pr-2">
        <View className="rounded-full px-1" style={styles.tag__bg}>
          <Text style={[styles.tag__text, styles.text_xs]}>{replies}</Text>
        </View>
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
export default TideTopicRowDemo
