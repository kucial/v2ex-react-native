import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native'
import React, { memo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { HeartIcon, ReplyIcon } from 'react-native-heroicons/outline'
import { HeartIcon as FilledHeartIcon } from 'react-native-heroicons/solid'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import RenderHtml from '@/components/RenderHtml'
import { InlineText, BlockText, Box } from '@/components/Skeleton/Elements'

import { useAuthService } from '@/containers/AuthService'

function ReplyRow(props) {
  const { width } = useWindowDimensions()
  const navigation = useNavigation()
  const { data } = props
  const { composeAuthedNavigation } = useAuthService()

  if (!data) {
    return (
      <View className="bg-white border-b border-gray-200">
        <View className="flex-1 py-2 pl-1">
          <View className="flex flex-row mb-2">
            <View className="flex flex-row items-center flex-1 pl-1 ">
              <Box className="w-[24px] h-[24px] rounded" />
              <View className="ml-2">
                <InlineText className="text-xs" width={120}></InlineText>
              </View>
            </View>
            <View className="pr-2 space-x-2 justify-center">
              <InlineText className="text-xs" width={24}></InlineText>
            </View>
          </View>
          <View className="pl-[34px] pr-4">
            <BlockText lines={[2, 4]} />
          </View>
        </View>
      </View>
    )
  }

  const { member } = data
  return (
    <View className="bg-white border-b border-gray-200 pt-2">
      <View className="flex flex-row pl-2">
        <View className="mr-2">
          <Image
            source={{
              uri: member.avatar_normal
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </View>
        <View className="flex-1">
          <View className="flex flex-row mb-2">
            <View className="flex flex-row items-center flex-1">
              <View className="">
                <Pressable
                  hitSlop={4}
                  className="active:opacity-60"
                  onPress={() => {
                    navigation.push('member', {
                      username: member.username
                    })
                  }}>
                  <Text className="font-bold text-xs text-gray-700">
                    {member.username}
                  </Text>
                </Pressable>
              </View>
              <View className="relative top-[1px] mx-1">
                <Text className="text-gray-400">·</Text>
              </View>
              <Text className="text-xs text-gray-400">{data.reply_time}</Text>
              {data.reply_device && (
                <Text className="text-xs text-gray-400 ml-2">
                  {data.reply_device}
                </Text>
              )}
              {!!data.thanks_count && (
                <>
                  <View className="relative top-[1px] mx-1">
                    <Text className="text-gray-400">·</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <FilledHeartIcon size={14} color={'#cc0000'} />
                    <Text className="text-xs text-gray-400 ml-1">
                      {data.thanks_count}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View className="pr-1 justify-center">
              <View className="px-[3px] rounded-full">
                <Text className="text-xs text-gray-400">#{data.num}</Text>
              </View>
            </View>
          </View>
          <View className="pr-2">
            <RenderHtml
              contentWidth={width - 24 - 8 - 8 - 16}
              source={{
                html: data.content_rendered,
                baseUrl: 'https://v2ex.com'
              }}
            />
          </View>
          <View className="py-[10px] relative flex flex-row items-center">
            <Pressable
              hitSlop={8}
              className={classNames(
                'h-[36px] px-2',
                '-m-2 flex flex-row items-center justify-center rounded-full',
                'active:bg-gray-200 active:opacity-60',
                'relative z-10'
              )}
              onPress={composeAuthedNavigation(() => {
                props.onReply(data)
              })}>
              <ReplyIcon size={14} color="#666" />
              <View className="ml-1">
                <Text className="text-xs text-gray-500">回复</Text>
              </View>
            </Pressable>
            <View className="w-3"></View>
            {data.thanked ? (
              <Text className="text-xs text-gray-500">已感谢</Text>
            ) : (
              <Pressable
                hitSlop={8}
                className={classNames(
                  'h-[36px] px-2',
                  '-m-2 flex flex-row items-center justify-center rounded-full',
                  'active:bg-gray-200 active:opacity-60',
                  'relative z-10'
                )}
                onPress={composeAuthedNavigation(() => {
                  props.onThank(data)
                })}>
                <HeartIcon size={14} color="#666" />
                <View className="ml-1">
                  <Text className="text-xs text-gray-500">感谢</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

ReplyRow.propTypes = {
  data: PropTypes.object,
  onThank: PropTypes.func,
  onReply: PropTypes.func
}

export default memo(ReplyRow)
