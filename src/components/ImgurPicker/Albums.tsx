import { ScrollView, StyleSheet, View } from 'react-native'

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
      <View style={albumsStyles.loaderWrap}>
        <Loader />
      </View>
    )
  } else if (albumsQuery.data) {
    content = (
      <View style={albumsStyles.container}>
        <View style={albumsStyles.grid}>
          {albumsQuery.data?.map((album) => (
            <View style={albumsStyles.gridItem} key={album.id}>
              <AlbumCard
                data={album}
                onPress={() => {
                  props.onSelectAlbum(album)
                }}
              />
            </View>
          ))}

          <View style={albumsStyles.gridItem}>
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

const albumsStyles = StyleSheet.create({
  loaderWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flexBasis: '33.333333%',
    padding: 2,
    marginBottom: 8,
  },
})
