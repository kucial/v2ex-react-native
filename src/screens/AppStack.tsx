import { Platform, SafeAreaView, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { headerLeft } from '@/components/BackButton'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

import AboutScreen from './AboutScreen'
import BrowserScreen from './BrowserScreen'
import FeedbackScreen from './FeedbackScreen'
import HomeScreen from './HomeScreen'
import MainTab from './MainTab'
import MemberInfoScreen from './MemberInfoScreen'
import MemberScreen from './MemberScreen'
import MyCollectedTopicsScreen from './MyCollectedTopicsScreen'
import MyCreatedTopicsScreen from './MyCreatedTopicsScreen'
import MyNotificationScreen from './MyNotificationScreen'
import MyProfileScreen from './MyProfileScreen'
import MyRepliedTopicsScreen from './MyRepliedTopicsScreen'
import MyScreen from './MyScreen'
import MyViewedTopicsScreen from './MyViewedTopicsScreen'
import NewTopicScreen from './NewTopicScreen'
import NodeScreen from './NodeScreen'
import NodesScreen from './NodesScreen'
import SearchScreen from './SearchScreen'
import SettingsHomeTabs from './SettingsHomeTabs'
import SettingsImgur from './SettingsImgur'
import SettingsPreference from './SettingsPreference'
import SettingsTheme from './SettingsTheme'
import SigninScreen from './SigninScreen'
import TopicEdit from './TopicEdit'
import TopicScreen from './TopicScreen'

const Stack = createNativeStackNavigator<AppStackParamList>()

const transparentHeaderBackground = () => (
  <View
    style={{
      height: '100%',
      backgroundColor: 'transparent',
    }}
    pointerEvents="none"
  />
)

function AppStack() {
  const { theme, styles } = useTheme()
  const tintColor = theme.colors.text_title

  const padLayout = usePadLayout()

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerLeft,
        headerTintColor: tintColor,
        headerTitleStyle: styles.text,
        fullScreenGestureEnabled: true,
        headerBackground() {
          return (
            <View
              style={[
                styles.layer1,
                styles.border_b_light,
                { height: '100%' },
              ]}></View>
          )
        },
      }}
      // initialRouteName={'edit-topic'}
    >
      {/* <Stack.Screen
        name="main"
        component={MainTab}
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
        }}
      /> */}
      {padLayout ? (
        <Stack.Group>
          <Stack.Screen
            name="feed"
            component={HomeScreen}
            options={{
              headerBackground: null,
              header() {
                return (
                  <SafeAreaView style={styles.layer1} className="min-h-[30]" />
                )
              },
            }}
          />
          <Stack.Screen
            name="nodes"
            component={NodesScreen}
            options={{
              title: '节点',
            }}
          />
          <Stack.Screen
            name="my"
            component={MyScreen}
            options={{
              title: '我的',
            }}
          />
        </Stack.Group>
      ) : (
        <Stack.Screen
          name="main"
          component={MainTab}
          options={{
            headerShown: false,
            headerTransparent: true,
            headerBackground: transparentHeaderBackground,
          }}
        />
      )}
      <Stack.Group>
        <Stack.Screen
          name="search"
          component={SearchScreen}
          options={{
            headerShown: false,
            headerTransparent: true,
            headerBackground: transparentHeaderBackground,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="topic"
          component={TopicScreen}
          options={{
            title: '话题',
          }}
        />
        <Stack.Screen
          name="node"
          component={NodeScreen}
          options={{
            title: '节点',
          }}
        />
        <Stack.Screen
          name="browser"
          component={BrowserScreen}
          options={{
            title: '内嵌网页',
          }}
        />
        <Stack.Screen
          name="member"
          component={MemberScreen}
          options={{
            headerShown: false,
            headerTransparent: true,
            headerBackground: transparentHeaderBackground,
          }}
        />
        <Stack.Screen
          name="member-info"
          component={MemberInfoScreen}
          options={{
            title: '用户信息',
          }}
        />
        <Stack.Screen
          name="about"
          component={AboutScreen}
          options={{
            title: '关于',
          }}
        />
        <Stack.Screen
          name="new-topic"
          component={NewTopicScreen}
          options={{
            title: '新主题',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="edit-topic"
          component={TopicEdit}
          options={{
            title: '编辑主题',
          }}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="notification"
          component={MyNotificationScreen}
          options={{
            title: '消息',
          }}
        />
        <Stack.Screen
          name="profile"
          component={MyProfileScreen}
          options={{
            title: '用户档案',
          }}
        />
        <Stack.Screen
          name="created-topics"
          component={MyCreatedTopicsScreen}
          options={{
            title: '创建的主题',
          }}
        />
        <Stack.Screen
          name="collected-topics"
          component={MyCollectedTopicsScreen}
          options={{
            title: '收藏的主题',
          }}
        />
        <Stack.Screen
          name="replied-topics"
          component={MyRepliedTopicsScreen}
          options={{
            title: '回复的主题',
          }}
        />
        <Stack.Screen
          name="viewed-topics"
          component={MyViewedTopicsScreen}
          options={{
            title: '浏览的主题（缓存）',
          }}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="imgur-settings"
          component={SettingsImgur}
          options={{
            title: 'Imgur 设置',
          }}
        />
        <Stack.Screen
          name="home-tab-settings"
          component={SettingsHomeTabs}
          options={{
            title: '首页标签设置',
          }}
        />
        <Stack.Screen
          name="preference-settings"
          component={SettingsPreference}
          options={{
            title: '功能设置',
          }}
        />
        <Stack.Screen
          name="theme-settings"
          component={SettingsTheme}
          options={{
            title: '主题样式',
          }}
        />
      </Stack.Group>
      <Stack.Screen
        name="signin"
        component={SigninScreen}
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
          presentation: Platform.OS === 'ios' ? 'modal' : undefined,
        }}
      />
      <Stack.Screen
        name="feedback"
        component={FeedbackScreen}
        options={{
          title: '意见反馈',
        }}
      />
    </Stack.Navigator>
  )
}

export default AppStack
