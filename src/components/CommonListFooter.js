import { View, Text, Pressable } from 'react-native'
import React from 'react'
import PropTypes from 'prop-types'

import Loader from './Loader'
import { hasReachEnd, isLoadingMore, shouldShowError } from '@/utils/swr'

export default function CommonListFooter(props) {
  const { data: listSwr } = props
  return (
    <View className="min-h-[52px] py-4 flex flex-row items-center justify-center">
      {isLoadingMore(listSwr) && (
        <View className="w-full flex flex-row items-center justify-center">
          <Loader />
        </View>
      )}
      {shouldShowError(listSwr) && (
        <View className="w-full px-4 text-center">
          <View className="my-4">
            <Text>{listSwr.error.message}</Text>
          </View>
          {listSwr.error.code !== 'member_locked' && (
            <View className="flex flex-row justify-center">
              <Pressable
                className="px-4 h-[44px] w-[120px] rounded-full bg-gray-900 text-white items-center justify-center active:opacity-60"
                onPress={() => {
                  listSwr.mutate()
                }}>
                <Text className="text-white">重试</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
      {hasReachEnd(listSwr) && (
        <View className="w-full flex flex-row justify-center py-4">
          <Text className="text-gray-400">到达底部啦</Text>
        </View>
      )}
    </View>
  )
}

CommonListFooter.propTypes = {
  data: PropTypes.object
}
