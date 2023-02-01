import { NodeDetail } from '@/utils/v2ex-client/types'

import { MemberBasic, NodeBasic, TopicBasic } from './v2ex'
declare global {
  type AppStackParamList = {
    topic: {
      id: number
      brief?: TopicBasic
    }
    main: null
    search: null
    node: {
      name: string
      brief?: NodeBasic
    }
    browser: {
      url: string
    }
    member: {
      username: string
      brief?: MemberBasic
      tab?: 'topics' | 'replies'
    }
    about: null
    'new-topic': {
      node?: NodeDetail
    }
    notification: null
    profile: null
    'created-topics': null
    'collected-topics': null
    'replied-topics': null
    'viewed-topics': null
    settings: null
    'imgur-settings': {
      autoBack?: boolean
    }
    'home-tab-settings': null
    'preference-settings': null
    signin: null

    feedback: null
  }

  type MainTabParamList = {
    feed: null
    nodes: null
    my: null
  }
}

export {}
