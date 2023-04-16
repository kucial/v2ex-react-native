import { NodeDetail } from '@/utils/v2ex-client/types'

import { MemberBasic, NodeBasic, TopicBasic } from './v2ex'
declare global {
  type AppStackParamList = {
    my: null
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
    'member-info': {
      username: string
    }
    about: null
    'new-topic': {
      node?: NodeDetail
    }
    notification: null
    profile: {
      initialTab?: string
    }
    balance: {
      username: string
    }
    'created-topics': null
    'collected-topics': null
    'replied-topics': null
    'viewed-topics': null
    settings: null
    'edit-topic': {
      id: number
    }
    'imgur-settings': {
      autoBack?: boolean
    }
    'home-tab-settings': null
    'preference-settings': null
    'theme-settings': null
    signin: null

    feedback: null
  }

  type AppStackRouteName = keyof AppStackParamList

  type MainTabParamList = {
    feed: null
    nodes: null
    my: null
  }
}

export {}
