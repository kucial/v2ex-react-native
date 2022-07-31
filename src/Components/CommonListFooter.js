import { View, Text, Pressable } from 'react-native'
import React from 'react'
import PropTypes from 'prop-types'

import Loader from '@/Components/Loader'

export default function CommonListFooter(props) {
  const { data: listSwr } = props
  return (
    <View className="min-h-[44px] py-4 flex flex-row items-center justify-center">
      {listSwr.isValidating && <Loader />}
      {listSwr.error && !listSwr.isValidating && (
        <View>
          <View className="my-4">
            <Text>{listSwr.error.message}</Text>
          </View>
          {listSwr.error.code !== 'member_locked' && (
            <View className="flex flex-row justify-center">
              <Pressable
                className="px-4 h-[44px] w-[120px] rounded-full bg-gray-900 text-white items-center justify-center"
                onPress={() => {
                  listSwr.mutate()
                }}>
                <Text className="text-white">重试</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

CommonListFooter.propTypes = {
  data: PropTypes.object
}
