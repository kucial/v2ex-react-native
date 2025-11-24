import { ScrollView, View } from 'react-native'

import MyRefreshControl from '@/components/MyRefreshControl'

import { useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum } from '@/containers/ImgurService/types'

import Loader from '../Loader'
import AlbumAdd from './AlbumAdd'
import AlbumCard from './AlbumCard'

type AlbumsProps = {
  onSelectAlbum(album: ImgurAlbum): void
}
export default function Albums(props: AlbumsProps) {
  const imgur = useImgurService()
  const albumsQuery = imgur.useAlbums()
  let content = null
  if (albumsQuery.isLoading) {
    content = (
      <View className='py-6 items-center justify-center'>
        <Loader />
      </View>
    )
  } else if (albumsQuery.data) {
    content = (
      <View className='py-2 px-[2px]'>
        <View className='flex flex-row flex-wrap'>
          {albumsQuery.data?.map((album) => (
            <View className='basis-1/3 p-[2px] mb-2' key={album.id}>
              <AlbumCard
                data={album}
                onPress={() => {
                  props.onSelectAlbum(album)
                }}
              />
            </View>
          ))}

          <View className='basis-1/3 p-[2px]'>
            <AlbumAdd />
          </View>
        </View>
      </View>
    )
  }
  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={albumsQuery.isRefetching}
          onRefresh={albumsQuery.refetch}
        />
      }
    >
      {content}
    </ScrollView>
  )
}
