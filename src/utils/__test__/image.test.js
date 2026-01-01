jest.mock('@thebeka/react-native-get-pixel-color', () => ({
  init: jest.fn(),
  pickColorAt: jest.fn(),
}))

jest.mock('expo-file-system', () => ({
  File: {
    downloadFileAsync: jest.fn(),
  },
  Paths: {
    cache: 'cache',
  },
  readAsStringAsync: jest.fn(),
}))

import { getBasename, getFilename, getImgXtension } from '../image'

describe('image utils', () => {
  describe('getImgXtension', () => {
    it('https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium', () => {
      expect(
        getImgXtension(
          'https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium',
          'png',
        ),
      ).toBe('jpg')
    })
    it('https://i.imgur.com/hulrFFq.png', () => {
      expect(getImgXtension('https://i.imgur.com/hulrFFq.png', 'png')).toBe(
        'png',
      )
    })
  })
  it('getBasename', () => {
    expect(getBasename('https://i.imgur.com/hulrFFq.png')).toBe('hulrFFq.png')
  })
  it('getFilename', () => {
    expect(
      getFilename(
        'https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium',
      ),
    ).toBe('FppS3KwaQAA_MDX')
  })
})
