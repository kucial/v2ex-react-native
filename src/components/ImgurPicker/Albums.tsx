import { ScrollView, View } from 'react-native'

import MyRefreshControl from '@/components/MyRefreshControl'
import { useImgurService } from '@/containers/ImgurService'
import { ImgurAlbum } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import AlbumAdd from './AlbumAdd'
import AlbumCard from './AlbumCard'

type AlbumsProps = {
  onSelectAlbum(album: ImgurAlbum): void
}
export default function Albums(props: AlbumsProps) {
  const imgur = useImgurService()
  const albumsQuery = imgur.useAlbums()
  const { theme } = useTheme()
  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={albumsQuery.isRefetching}
          onRefresh={albumsQuery.refetch}
        />
      }>
      <View className="py-2 px-[2px]">
        <View className="flex flex-row flex-wrap">
          {albumsQuery.data?.map((album) => (
            <View className="basis-1/3 p-[2px] mb-2" key={album.id}>
              <AlbumCard
                data={album}
                onPress={() => {
                  props.onSelectAlbum(album)
                }}
              />
            </View>
          ))}

          <View className="basis-1/3 p-[2px]">
            <AlbumAdd />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
