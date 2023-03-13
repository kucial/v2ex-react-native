import { Platform, PlatformIOSStatic, View } from 'react-native'

import AppSidebar from '../AppSidebar'
export default function Layout(props) {
  // if (Platform.OS === 'ios') {
  //   const platformIOS = Platform as PlatformIOSStatic
  //   if (platformIOS.isPad) {
  //     return (
  //       <View className="flex-1 flex flex-row">
  //         <View style={{ width: 84 }}>
  //           <AppSidebar />
  //         </View>
  //         <View
  //           style={{
  //             flex: 1,
  //           }}>
  //           {props.children}
  //         </View>
  //       </View>
  //     )
  //   }
  // }
  return props.children
}
