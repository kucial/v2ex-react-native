import { ScrollView, Text, View } from 'react-native'
import useSWR from 'swr'

import { InlineText } from '@/components/Skeleton/Elements'
import { localTime } from '@/utils/time'

const LineItem = (props) => {
  return (
    <View
      className={`pl-4 bg-white ${
        props.isLast ? 'border-b border-b-neutral-300' : ''
      }`}>
      <View
        className={`flex flex-row flex-1 items-start py-4 ${
          props.isLast ? '' : 'border-b border-b-neutral-300 '
        }}`}>
        <View className="w-[80px]">
          <Text className="text-neutral-500">{props.label}</Text>
        </View>
        <View>{props.value}</View>
      </View>
    </View>
  )
}

export default function MemberInfo(props) {
  const memberSwr = useSWR(`/api/members/show.json?username=${props.username}`)
  return null
  return (
    <ScrollView>
      <LineItem
        label="V2Ex"
        value={
          memberSwr.data ? <Text>{memberSwr.data.url}</Text> : <InlineText />
        }
      />
      <LineItem
        label="创建时间"
        value={
          memberSwr.data ? (
            <Text>{localTime(memberSwr.data.created * 1000)}</Text>
          ) : (
            <InlineText />
          )
        }
      />
      <LineItem
        label="签名"
        isLast
        value={
          memberSwr.data ? (
            <Text>{memberSwr.data.tagline}</Text>
          ) : (
            <InlineText />
          )
        }
      />
      <LineItem
        label="所在地"
        isLast
        value={
          memberSwr.data ? (
            <Text>{memberSwr.data.location}</Text>
          ) : (
            <InlineText />
          )
        }
      />
      <LineItem
        label="个人简介"
        isLast
        value={
          memberSwr.data ? <Text>{memberSwr.data.bio}</Text> : <InlineText />
        }
      />
      <LineItem
        label="个人网站"
        isLast
        value={
          memberSwr.data ? (
            <Text>{memberSwr.data.website}</Text>
          ) : (
            <InlineText />
          )
        }
      />
      <LineItem
        label="Github"
        isLast
        value={
          memberSwr.data ? <Text>{memberSwr.data.github}</Text> : <InlineText />
        }
      />
      <LineItem
        label="PSN ID"
        isLast
        value={
          memberSwr.data ? <Text>{memberSwr.data.psn}</Text> : <InlineText />
        }
      />
      <LineItem
        label="Twitter"
        isLast
        value={
          memberSwr.data ? (
            <Text>{memberSwr.data.twitter}</Text>
          ) : (
            <InlineText />
          )
        }
      />
    </ScrollView>
  )
}
