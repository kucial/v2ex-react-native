import { Redirect } from 'expo-router'

function Index() {
  return <Redirect href={'/(stack)/(tabs)/feed'} />
  // return <Redirect href={'/playground'} />
  // return <Redirect href={'/demand/new'} />
}

export default Index
