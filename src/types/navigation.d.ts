import { MemberBasic, NodeBasic, TopicBasic } from './v2ex'
declare global {
  type AppStackParamList = {
    'topic': {
      id: number,
      brief?: TopicBasic
    },
    'main': {},
    'search': {},
    'node': {
      name: string,
      brief?: NodeBasic,
    },
    'browser': {
      url: string,
    },
    'member': {
      username: string,
      brief?: MemberBasic,
      tab?: 'topics' | 'replies',
    },
    'about': {},
    'new-topic': {
      node?: {
        name: string,
      },
    },
    'notification': {

    },
    'profile': {},
    'created-topics': {},
    'collected-topics': {},
    'replied-topics': {},
    'viewed-topics': {},
    'settings': {},
    'imgur-settings': {
      autoBack?: boolean,
    },
    'home-tab-settings': {},
    'preference-settings': {},
    'signin': {},
  }

  type MainTabParamList = {
    feed: {},
    nodes: {},
    my: {},
  }
}
export { }