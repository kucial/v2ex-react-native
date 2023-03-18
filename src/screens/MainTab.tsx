import {
  HomeIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import MainScreenHeader from '@/components/MainScreenHeader'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

import HomeScreen from './HomeScreen'
import MyScreen from './MyScreen'
import NodesScreen from './NodesScreen'

const Tab = createBottomTabNavigator()
function MainTab() {
  const { theme, styles } = useTheme()
  const padLayout = usePadLayout()

  return (
    <Tab.Navigator
      initialRouteName="feed"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarInactiveTintColor: theme.colors.text_meta,
        tabBarStyle: padLayout ? { display: 'none' } : styles.overlay,
      }}>
      <Tab.Screen
        name="nodes"
        component={NodesScreen}
        options={{
          tabBarIcon: RectangleStackIcon,
          tabBarLabel: '节点',
          title: '节点',
          header: (props) => <MainScreenHeader {...props} />,
        }}
      />
      <Tab.Screen
        name="feed"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          tabBarLabel: '主题',
          title: '主题',
          header: (props) => <MainScreenHeader {...props} />,
        }}
      />
      <Tab.Screen
        name="my"
        component={MyScreen}
        options={{
          tabBarIcon: UserIcon,
          tabBarLabel: '我的',
          title: '我的',
          header: (props) => <MainScreenHeader {...props} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default MainTab
