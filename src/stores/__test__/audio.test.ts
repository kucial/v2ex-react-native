import { getAudioResourcesFromPages, useAudioStore } from '@/stores/audio'

jest.mock('@/utils/remoteDevtools', () => ({
  remoteDevtools: (initializer: unknown) => initializer,
}))

jest.mock('@/utils/storage', () => ({
  stateStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(() => null),
    removeItem: jest.fn(),
  },
}))

describe('audio store', () => {
  beforeEach(() => {
    useAudioStore.setState({
      history: {},
      resources: {},
    })
  })

  it('persists playback history with track metadata', () => {
    useAudioStore.getState().updateHistory(
      {
        title: 'Episode 1',
        url: 'https://example.com/audio.mp3',
        artist: 'V2EX',
        artworkUrl: 'https://example.com/cover.jpg',
        sourceUrl: 'https://example.com/post',
      },
      42,
      120,
    )

    expect(
      useAudioStore.getState().history['https://example.com/audio.mp3'],
    ).toMatchObject({
      title: 'Episode 1',
      artist: 'V2EX',
      artworkUrl: 'https://example.com/cover.jpg',
      sourceUrl: 'https://example.com/post',
      lastPosition: 42,
      duration: 120,
    })
  })

  it('merges richer resource metadata for an existing track', () => {
    const store = useAudioStore.getState()

    store.addResources([
      {
        title: 'Episode 1',
        url: 'https://example.com/audio.mp3',
      },
    ])

    store.addResources([
      {
        title: 'Episode 1',
        url: 'https://example.com/audio.mp3',
        artist: 'Planet',
        artworkUrl: 'https://example.com/cover.jpg',
      },
    ])

    expect(
      useAudioStore.getState().resources['https://example.com/audio.mp3'],
    ).toMatchObject({
      title: 'Episode 1',
      artist: 'Planet',
      artworkUrl: 'https://example.com/cover.jpg',
    })
  })

  it('maps planet avatar to intercepted audio artwork', () => {
    expect(
      getAudioResourcesFromPages([
        {
          data: [
            {
              title: 'Post title',
              planet: {
                site_title: 'Planet',
                avatar: 'https://example.com/artist-cover.png',
              },
              audio: {
                url: 'https://example.com/audio.mp3',
                title: 'Episode 1',
                author: 'Author',
              },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        title: 'Episode 1',
        url: 'https://example.com/audio.mp3',
        artist: 'Author',
        artworkUrl: 'https://example.com/artist-cover.png',
      },
    ])
  })
})
