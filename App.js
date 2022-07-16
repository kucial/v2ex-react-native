import { TailwindProvider } from 'tailwindcss-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {
  CollectionIcon,
  HomeIcon,
  UserIcon
} from 'react-native-heroicons/outline'

import MyHeader from './src/Components/MyHeader'

import HomeScreen from './src/screens/HomeScreen'
import NodesScreen from './src/screens/NodesScreen'
import MyScreen from './src/screens/MyScreen'
import SearchScreen from './src/screens/SearchScreen'
import PostScreen from './src/screens/PostScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#e91e63'
        // headerShown: false,
      }}>
      <Tab.Screen
        name="feed"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          header: MyHeader
        }}
      />
      <Tab.Screen
        name="nodes"
        component={NodesScreen}
        options={{
          tabBarIcon: CollectionIcon,
          header: MyHeader
        }}
      />
      <Tab.Screen
        name="my"
        component={MyScreen}
        options={{
          tabBarIcon: UserIcon
        }}
      />
    </Tab.Navigator>
  )
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="main"
        component={MainTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="post" component={PostScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <TailwindProvider>
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </TailwindProvider>
  )
}
